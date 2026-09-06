import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packetDir = path.join(root, 'docs/source-packets/wits-v0');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const matrix = readJson(path.join(packetDir, 'local-owner-profile-evidence-matrix.json'));
const fixtures = readJson(path.join(packetDir, 'local-owner-profile-fixtures.json'));
const proofPath = path.join(packetDir, matrix.ciEvidence.evidenceFile);
const proofBytes = readFileSync(proofPath);
const proof = JSON.parse(proofBytes);

const contractFiles = {
  profileSha256: 'local-owner-profile.md',
  fixturesSha256: 'local-owner-profile-fixtures.json',
  synthesisSha256: 'local-owner-profile-review-synthesis.md',
};
for (const [pin, file] of Object.entries(contractFiles)) {
  assert.equal(sha256(readFileSync(path.join(packetDir, file))), matrix.contract[pin], file);
}

assert.equal(sha256(proofBytes), matrix.ciEvidence.artifactResultSha256);
assert.equal(proof.schema, matrix.ciEvidence.artifactSchema);
assert.equal(proof.gitHead, matrix.ciEvidence.checkoutCommit);
assert.equal(proof.trackedDiffSha256, matrix.independentLocalValidation.trackedDiffSha256);
assert.deepEqual(proof.contract, {
  commit: matrix.contract.sourceCommit,
  profileSha256: matrix.contract.profileSha256,
  fixturesSha256: matrix.contract.fixturesSha256,
  synthesisSha256: matrix.contract.synthesisSha256,
});
assert.equal(proof.evidenceIntegrity.defectSpecies, matrix.evidenceIntegrity.defectSpecies);
assert.equal(proof.evidenceIntegrity.rule, matrix.evidenceIntegrity.rule);
assert.equal(proof.providerCalls, 0);
assert.equal(proof.networkCallbacks, 0);
assert.equal(proof.secretsExported, false);
assert.equal(proof.testRun.outputSha256, matrix.ciEvidence.localOwnerTestOutputSha256);

for (const [source, digest] of Object.entries(matrix.sourceHashes)) {
  assert.equal(proof.sourceHashes[source], digest, source);
}

assert.equal(fixtures.cases.length, 44);
assert.equal(matrix.cases.length, fixtures.cases.length);
assert.equal(proof.inventory.length, fixtures.cases.length);

for (const [index, fixture] of fixtures.cases.entries()) {
  const entry = matrix.cases[index];
  const observed = proof.inventory[index];
  const receipt = observed.receipt;
  assert.equal(entry.id, fixture.id, `matrix case ${index}`);
  assert.equal(observed.id, fixture.id, `proof case ${index}`);
  assert.equal(observed.required, fixture.expected, fixture.id);
  assert.equal(entry.status, 'observed', fixture.id);
  assert.equal(observed.status, 'observed', fixture.id);
  assert.equal(receipt.id, fixture.id, fixture.id);
  assert.equal(receipt.status, 'passed', fixture.id);
  assert.equal(
    entry.receiptRef,
    `${matrix.ciEvidence.evidenceFile}#/inventory/${index}/receipt`,
    fixture.id,
  );
  assert.equal(entry.receiptSha256, sha256(JSON.stringify(receipt)), fixture.id);
}

const counts = matrix.cases.reduce((result, entry) => {
  result[entry.receiptKind] = (result[entry.receiptKind] ?? 0) + 1;
  return result;
}, {});
assert.deepEqual(counts, {
  unit: matrix.ciEvidence.unitReceipts,
  process: matrix.ciEvidence.processReceipts,
});
assert.equal(proof.inventory.filter((entry) => entry.status !== 'observed').length, 0);

console.log(JSON.stringify({
  passed: true,
  artifactSha256: matrix.ciEvidence.artifactResultSha256,
  cases: matrix.cases.length,
  unitReceipts: counts.unit,
  processReceipts: counts.process,
}));
