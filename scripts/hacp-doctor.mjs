#!/usr/bin/env node

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const args = process.argv.slice(2);

function usage() {
  return [
    "Usage: npm run hacp:doctor -- <path> [--json] [--manifest <manifest.json>]",
    "",
    "Validates HACP JSON artifacts locally. It does not execute packets,",
    "dispatch work, call models, write GitHub, approve outcomes, or perform transport."
  ].join("\n");
}

function parseArgs(rawArgs) {
  const parsed = { json: false, manifest: null, target: null };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--json") {
      parsed.json = true;
      continue;
    }
    if (arg === "--manifest") {
      const value = rawArgs[index + 1];
      if (!value) {
        throw new Error("--manifest requires a path");
      }
      parsed.manifest = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (parsed.target) {
      throw new Error(`Unexpected extra path: ${arg}`);
    }
    parsed.target = arg;
  }
  if (!parsed.target) {
    throw new Error("Missing path");
  }
  return parsed;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON at ${filePath}: ${error.message}`);
  }
}

async function collectJsonFiles(targetPath) {
  const info = await stat(targetPath);
  if (info.isFile()) {
    return targetPath.endsWith(".json") ? [targetPath] : [];
  }

  const entries = await readdir(targetPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const childPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectJsonFiles(childPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(childPath);
    }
  }
  return files.sort();
}

function makeAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

async function loadSchemas(ajv) {
  const schemaDir = path.join(repoRoot, "schemas");
  const entries = await readdir(schemaDir, { withFileTypes: true });
  const schemaByFile = new Map();
  const schemaByRecordKind = new Map();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".schema.json")) {
      continue;
    }
    const filePath = path.join(schemaDir, entry.name);
    const schema = await readJson(filePath);
    ajv.addSchema(schema, schema.$id || entry.name);
    schemaByFile.set(entry.name, schema);

    const recordKind = schema.properties?.record_kind?.const;
    if (recordKind) {
      schemaByRecordKind.set(recordKind, schema);
    }
  }

  return { schemaByFile, schemaByRecordKind };
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function diagnostic(filePath, code, message, details = {}) {
  return {
    path: relative(filePath),
    code,
    message,
    ...details
  };
}

function schemaNameForArtifact(artifact) {
  const kind = artifact?.record_kind;
  if (kind === "hacp.task_packet") return "task-packet.schema.json";
  if (kind === "hacp.agent_report") return "agent-report.schema.json";
  if (kind === "hacp.human_decision_gate") return "human-decision.schema.json";
  if (kind === "hacp.evidence_set") return "evidence-set.schema.json";
  if (kind === "hacp.stop_response") return "stop-response.schema.json";
  if (kind === "hacp.review_finding") return "review-finding.schema.json";
  if (kind === "hacp.loop_policy") return "loop-policy.schema.json";
  return null;
}

function validateArtifact(ajv, schemas, filePath, artifact, schemaName) {
  const resolvedSchemaName = schemaName || schemaNameForArtifact(artifact);
  if (!resolvedSchemaName) {
    return [
      diagnostic(filePath, "SCHEMA_NOT_RESOLVED", "Could not resolve schema from record_kind.", {
        record_kind: artifact?.record_kind ?? null
      })
    ];
  }

  const schema = schemas.schemaByFile.get(resolvedSchemaName);
  if (!schema) {
    return [
      diagnostic(filePath, "SCHEMA_NOT_FOUND", "Referenced schema file was not found.", {
        schema: resolvedSchemaName
      })
    ];
  }

  const validate = ajv.getSchema(schema.$id || resolvedSchemaName) || ajv.compile(schema);
  if (validate(artifact)) {
    return [];
  }

  return (validate.errors || []).map((error) =>
    diagnostic(filePath, "SCHEMA_VALIDATION_FAILED", error.message || "Schema validation failed.", {
      schema: resolvedSchemaName,
      field: error.instancePath || "/",
      keyword: error.keyword,
      params: error.params
    })
  );
}

async function validateFileSet(ajv, schemas, files) {
  const diagnostics = [];
  for (const file of files) {
    const artifact = await readJson(file);
    diagnostics.push(...validateArtifact(ajv, schemas, file, artifact, null));
  }
  return diagnostics;
}

async function findManifest(targetPath, explicitManifest) {
  if (explicitManifest) {
    return path.resolve(repoRoot, explicitManifest);
  }
  const candidate = path.join(targetPath, "manifest.json");
  try {
    const info = await stat(candidate);
    return info.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

async function validateManifest(ajv, schemas, manifestPath) {
  const manifest = await readJson(manifestPath);
  const corpusRoot = manifest.corpus_root
    ? path.resolve(repoRoot, manifest.corpus_root)
    : path.dirname(manifestPath);
  const diagnostics = [];
  const validEntries = manifest.expected_valid || [];
  const invalidEntries = manifest.expected_invalid || [];

  for (const entry of validEntries) {
    const filePath = path.join(corpusRoot, entry.path);
    const artifact = await readJson(filePath);
    const entryDiagnostics = validateArtifact(ajv, schemas, filePath, artifact, entry.schema);
    if (entryDiagnostics.length > 0) {
      diagnostics.push(...entryDiagnostics.map((item) => ({
        ...item,
        code: "MANIFEST_EXPECTED_VALID_FAILED"
      })));
    }
  }

  for (const entry of invalidEntries) {
    const filePath = path.join(corpusRoot, entry.path);
    const artifact = await readJson(filePath);
    const entryDiagnostics = validateArtifact(ajv, schemas, filePath, artifact, entry.schema);
    if (entryDiagnostics.length === 0) {
      diagnostics.push(diagnostic(filePath, "MANIFEST_EXPECTED_INVALID_PASSED", "Fixture was expected to fail validation but passed.", {
        schema: entry.schema
      }));
    }
  }

  return {
    diagnostics,
    manifest: {
      path: relative(manifestPath),
      expected_valid: validEntries.length,
      expected_invalid: invalidEntries.length
    }
  };
}

function renderHuman(result) {
  if (result.ok) {
    const manifest = result.manifest
      ? ` Manifest: ${result.manifest.expected_valid} expected-valid, ${result.manifest.expected_invalid} expected-invalid.`
      : "";
    return `HACP doctor passed for ${result.target}.${manifest}`;
  }

  const lines = [`HACP doctor found ${result.diagnostics.length} issue(s) for ${result.target}:`];
  for (const item of result.diagnostics) {
    lines.push(`- ${item.path}: ${item.code} ${item.field ? `at ${item.field} ` : ""}${item.message}`);
  }
  return lines.join("\n");
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(args);
  } catch (error) {
    console.error(`${error.message}\n\n${usage()}`);
    process.exit(2);
  }

  const targetPath = path.resolve(repoRoot, parsed.target);
  const ajv = makeAjv();
  const schemas = await loadSchemas(ajv);
  const manifestPath = await findManifest(targetPath, parsed.manifest);

  const result = {
    ok: true,
    target: relative(targetPath),
    diagnostics: [],
    manifest: null
  };

  try {
    if (manifestPath) {
      const manifestResult = await validateManifest(ajv, schemas, manifestPath);
      result.diagnostics = manifestResult.diagnostics;
      result.manifest = manifestResult.manifest;
    } else {
      const files = await collectJsonFiles(targetPath);
      result.diagnostics = await validateFileSet(ajv, schemas, files);
    }
  } catch (error) {
    const payload = {
      ok: false,
      target: parsed.target,
      diagnostics: [{
        path: parsed.target,
        code: "ENVIRONMENT_ERROR",
        message: error.message
      }]
    };
    if (parsed.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.error(renderHuman(payload));
    }
    process.exit(2);
  }

  result.ok = result.diagnostics.length === 0;
  if (parsed.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(renderHuman(result));
  }
  process.exit(result.ok ? 0 : 1);
}

main();
