#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const exampleDir = path.join(root, "examples", "cli-bridge-contract", "v0");

const expectedFiles = [
  "corporate-approved-tool-profile.valid.json",
  "requested-cli-work-packet.valid.json",
  "runner-report.accepted-profile-proof.valid.json",
  "runtime-toolchain-mismatch.rejected.json",
  "risky-flag-approval-missing.rejected.json",
  "waiver-covered-mismatch.accepted.json",
  "doctor-ready.valid.json",
  "doctor-blocked.valid.json"
];

const boundaryChecks = [
  "notWorkCompletion",
  "noExternalSideEffects"
];

function collectBoundaryObjects(value, found = []) {
  if (!value || typeof value !== "object") {
    return found;
  }

  if (!Array.isArray(value) && value.boundary && typeof value.boundary === "object" && !Array.isArray(value.boundary)) {
    found.push(value.boundary);
  }

  for (const child of Object.values(value)) {
    collectBoundaryObjects(child, found);
  }

  return found;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const entries = new Set(await readdir(exampleDir));

for (const file of expectedFiles) {
  if (!entries.has(file)) {
    fail(`Missing CLI bridge example: ${file}`);
    continue;
  }

  const filePath = path.join(exampleDir, file);
  const raw = await readFile(filePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${file}: invalid JSON: ${error.message}`);
    continue;
  }

  if (raw.includes("/Users/") || raw.includes("joefeser/what-is-the-spec")) {
    fail(`${file}: example must not contain private local paths or source repo names`);
  }

  const boundaryObjects = collectBoundaryObjects(parsed);
  for (const key of boundaryChecks) {
    const hasExactBooleanBoundary = boundaryObjects.some((boundary) => boundary[key] === true);
    if (!hasExactBooleanBoundary) {
      fail(`${file}: missing boundary boolean ${key}=true`);
    }
  }
}

if (!process.exitCode) {
  console.log(`CLI bridge example check passed for ${expectedFiles.length} files.`);
}
