#!/usr/bin/env node

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { lstat, open, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  diagnosticCodes,
  validateSemantics,
  loadValidators,
  validateCorpus,
  validateInput
} from './compute-vectors.mjs';

const repoRoot = process.cwd();
const schemaRoot = path.join(repoRoot, 'schemas/v0.3-candidate');
const canonicalManifestPath = path.join(schemaRoot, 'fixtures/manifest.json');
const externalManifestSchemaPath = path.join(schemaRoot, 'package/external-bundle-manifest.schema.json');
const externalManifestName = 'external-bundle-manifest.json';
const semanticValidatorPath = path.join(repoRoot, 'scripts/compute-vectors.mjs');
const schemaFiles = Object.freeze([
  'common-defs.schema.json',
  'task-packet.schema.json',
  'review-finding.schema.json',
  'human-decision.schema.json',
  'consumption-receipt.schema.json',
  'continuation-context.schema.json',
  'agent-report.schema.json',
  'stop-response.schema.json'
]);

const roleKinds = Object.freeze({
  task_packet: 'task-packet',
  decision_request: 'review-finding',
  authority_basis_decision: 'human-decision',
  consumption_receipt: 'consumption-receipt',
  continuation_context: 'continuation-context',
  agent_report: 'agent-report',
  stop_response: 'stop-response',
  response_decision: 'human-decision'
});

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function loadExternalManifestValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(await readJson(externalManifestSchemaPath));
}

function safeRelativeRecordPath(relativePath) {
  if (typeof relativePath !== 'string'
    || path.isAbsolute(relativePath)
    || relativePath.includes('\\')
    || path.posix.normalize(relativePath) !== relativePath
    || relativePath.split('/').includes('..')
    || !/^records\/[A-Za-z0-9._/-]+\.json$/.test(relativePath)) {
    throw new Error(`EXTERNAL_PATH_INVALID: ${String(relativePath)}`);
  }
  return relativePath;
}

async function assertNoSymlink(root, relativePath) {
  let current = root;
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if ((await lstat(current)).isSymbolicLink()) {
      throw new Error(`EXTERNAL_PATH_SYMLINK: ${relativePath}`);
    }
  }
}

async function resolveExternalRecord(root, relativePath) {
  safeRelativeRecordPath(relativePath);
  await assertNoSymlink(root, relativePath);
  const resolvedRoot = await realpath(root);
  const resolved = await realpath(path.join(root, relativePath));
  if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`EXTERNAL_PATH_ESCAPE: ${relativePath}`);
  }
  return resolved;
}

async function readOpenedRegularFile(root, file, label) {
  let handle;
  try {
    handle = await open(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
    const openedStat = await handle.stat();
    if (!openedStat.isFile()) throw new Error(`EXTERNAL_PATH_NOT_REGULAR_FILE: ${label}`);
    const resolvedRoot = await realpath(root);
    const resolvedAfterOpen = await realpath(file);
    if (!resolvedAfterOpen.startsWith(`${resolvedRoot}${path.sep}`)) {
      throw new Error(`EXTERNAL_PATH_ESCAPE: ${label}`);
    }
    const pathStat = await lstat(file);
    if (pathStat.isSymbolicLink() || pathStat.dev !== openedStat.dev || pathStat.ino !== openedStat.ino) {
      throw new Error(`EXTERNAL_PATH_CHANGED_DURING_READ: ${label}`);
    }
    return await handle.readFile();
  } finally {
    await handle?.close();
  }
}

async function readConfinedRegularFile(root, relativePath) {
  const file = await resolveExternalRecord(root, relativePath);
  return readOpenedRegularFile(root, file, relativePath);
}

async function assertExactExternalLayout(root) {
  const rootEntries = await readdir(root, { withFileTypes: true });
  const rootNames = rootEntries.map((entry) => entry.name).sort();
  if (rootNames.join('|') !== 'external-bundle-manifest.json|records') {
    throw new Error('EXTERNAL_ROOT_LAYOUT_INVALID');
  }
  const manifestEntry = rootEntries.find((entry) => entry.name === externalManifestName);
  const recordsEntry = rootEntries.find((entry) => entry.name === 'records');
  if (!manifestEntry?.isFile() || manifestEntry.isSymbolicLink()
    || !recordsEntry?.isDirectory() || recordsEntry.isSymbolicLink()) {
    throw new Error('EXTERNAL_ROOT_LAYOUT_INVALID');
  }
}

async function listExternalJson(root) {
  const recordsRoot = path.join(root, 'records');
  const result = [];
  async function walk(directory, relative) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`EXTERNAL_PATH_SYMLINK: records/${childRelative}`);
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), childRelative);
      else if (entry.isFile() && entry.name.endsWith('.json')) result.push(`records/${childRelative}`);
      else throw new Error(`EXTERNAL_RECORDS_LAYOUT_INVALID: records/${childRelative}`);
    }
  }
  await walk(recordsRoot, '');
  return result.sort();
}

async function validateExternalManifest(manifest, root, canonicalManifestBytes) {
  const validate = await loadExternalManifestValidator();
  if (!validate(manifest)) {
    throw new Error(`EXTERNAL_MANIFEST_SCHEMA_INVALID: ${JSON.stringify(validate.errors)}`);
  }
  if (manifest.conformancePackage.manifestSha256 !== sha256(canonicalManifestBytes)) {
    throw new Error('EXTERNAL_PACKAGE_PIN_MISMATCH');
  }
  for (const file of schemaFiles) {
    const actual = sha256(await readFile(path.join(schemaRoot, file)));
    if (manifest.conformancePackage.recordSchemaSha256[file] !== actual) {
      throw new Error(`EXTERNAL_PACKAGE_SCHEMA_PIN_MISMATCH: ${file}`);
    }
  }
  if (manifest.conformancePackage.semanticValidatorSha256 !== sha256(await readFile(semanticValidatorPath))) {
    throw new Error('EXTERNAL_PACKAGE_VALIDATOR_PIN_MISMATCH');
  }

  const inventoryPaths = manifest.fixtureInventory.map((item) => item.path);
  if (new Set(inventoryPaths).size !== inventoryPaths.length) {
    throw new Error('EXTERNAL_DUPLICATE_INVENTORY_PATH');
  }
  const inventory = new Map(manifest.fixtureInventory.map((item) => [item.path, item]));
  const usedPaths = new Set();

  for (const bundle of manifest.bundles) {
    const roles = bundle.records.map((item) => item.role);
    const paths = bundle.records.map((item) => item.path);
    if (new Set(roles).size !== roles.length || new Set(paths).size !== paths.length) {
      throw new Error(`EXTERNAL_BUNDLE_DUPLICATE: ${bundle.id}`);
    }
    for (const item of bundle.records) {
      const inventoryItem = inventory.get(item.path);
      if (!inventoryItem || inventoryItem.schema !== `${roleKinds[item.role]}.schema.json`) {
        throw new Error(`EXTERNAL_BUNDLE_INVENTORY_MISMATCH: ${bundle.id}:${item.path}`);
      }
      usedPaths.add(item.path);
    }
  }
  if (usedPaths.size !== inventory.size || [...inventory.keys()].some((item) => !usedPaths.has(item))) {
    throw new Error('EXTERNAL_UNCOVERED_INVENTORY');
  }

  const stopBundle = manifest.bundles.find((item) => item.kind === 'pre_start_stop');
  const responseBundle = manifest.bundles.find((item) => item.kind === 'stop_decision_response');
  for (const role of ['task_packet', 'decision_request', 'authority_basis_decision', 'stop_response']) {
    const left = stopBundle.records.find((item) => item.role === role)?.path;
    const right = responseBundle.records.find((item) => item.role === role)?.path;
    if (!left || left !== right) throw new Error(`EXTERNAL_SHARED_ANTECEDENT_INVALID: ${role}`);
  }

  const actualPaths = await listExternalJson(root);
  if (actualPaths.join('|') !== [...inventory.keys()].sort().join('|')) {
    throw new Error('EXTERNAL_FILE_INVENTORY_MISMATCH');
  }
  return inventory;
}

async function loadExternalEntries(bundle, inventory, root) {
  const entries = [];
  for (const descriptor of bundle.records) {
    const bytes = await readConfinedRegularFile(root, descriptor.path);
    const inventoryItem = inventory.get(descriptor.path);
    if (sha256(bytes) !== inventoryItem.sha256) {
      throw new Error(`EXTERNAL_FILE_DIGEST_MISMATCH: ${descriptor.path}`);
    }
    const record = JSON.parse(bytes.toString('utf8'));
    entries.push({ ...descriptor, record });
  }
  return entries;
}

async function validateExternalBundleRoot(root) {
  const resolvedRoot = await realpath(root);
  const manifestPath = path.join(resolvedRoot, externalManifestName);
  await assertExactExternalLayout(resolvedRoot);
  const manifestBytes = await readOpenedRegularFile(resolvedRoot, manifestPath, externalManifestName);

  const canonicalManifestBytes = await readFile(canonicalManifestPath);
  const canonicalManifest = JSON.parse(canonicalManifestBytes.toString('utf8'));
  const canonicalResult = await validateCorpus(canonicalManifest);

  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const inventory = await validateExternalManifest(manifest, resolvedRoot, canonicalManifestBytes);
  const validators = await loadValidators();
  const bundleResults = [];
  const allEntriesByPath = new Map();
  for (const bundle of manifest.bundles) {
    const entries = await loadExternalEntries(bundle, inventory, resolvedRoot);
    const codes = diagnosticCodes(await validateInput(entries, validators, {}, bundle));
    if (codes.length > 0) {
      throw new Error(`EXTERNAL_BUNDLE_INVALID: ${bundle.id}:${JSON.stringify(codes)}`);
    }
    for (const entry of entries) allEntriesByPath.set(entry.path, entry);
    bundleResults.push({ id: bundle.id, kind: bundle.kind, records: entries.length });
  }
  const crossBundleCodes = diagnosticCodes(validateSemantics([...allEntriesByPath.values()], {}, 'explicit'));
  if (crossBundleCodes.includes('STOP_AFTER_WORK')) {
    throw new Error('EXTERNAL_CROSS_BUNDLE_STOP_AFTER_WORK');
  }

  return {
    ok: true,
    candidateOnly: true,
    qualificationIntent: manifest.qualificationIntent,
    producer: manifest.producer,
    conformancePackage: {
      manifestSha256: manifest.conformancePackage.manifestSha256,
      recordSchemaSha256: manifest.conformancePackage.recordSchemaSha256,
      semanticValidatorSha256: manifest.conformancePackage.semanticValidatorSha256,
      canonicalNegativeCases: canonicalResult.expectedInvalid,
      diagnosticSetsComparedExactly: true
    },
    bundles: bundleResults
  };
}

function rootArgument(argv) {
  const index = argv.indexOf('--root');
  if (index === -1 || !argv[index + 1] || argv.length !== 2) {
    throw new Error('USAGE: node scripts/validate-external-bundle.mjs --root <external-bundle-root>');
  }
  return path.resolve(argv[index + 1]);
}

async function main() {
  try {
    const result = await validateExternalBundleRoot(rootArgument(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error.message }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

export {
  externalManifestName,
  loadExternalManifestValidator,
  safeRelativeRecordPath,
  validateExternalBundleRoot,
  validateExternalManifest
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
