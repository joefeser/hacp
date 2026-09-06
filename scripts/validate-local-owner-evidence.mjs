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
const localProofPath = path.join(packetDir, matrix.independentLocalValidation.evidenceFile);
const localProofBytes = readFileSync(localProofPath);
const localProof = JSON.parse(localProofBytes);

const contractFiles = {
  profileSha256: 'local-owner-profile.md',
  fixturesSha256: 'local-owner-profile-fixtures.json',
  synthesisSha256: 'local-owner-profile-review-synthesis.md',
};
// Source and process inventories from the pinned v3 proof generator. These
// must not be inferred from editable matrix labels or a partial hash map.
const sourceFiles = [
  ...Object.values(contractFiles).map((file) => `docs/contracts/local-owner-continuation/${file}`),
  'src/store-admission.ts',
  'src/store-schema.ts',
  'src/consumption/store.ts',
  'src/local-owner/jcs.ts',
  'src/local-owner/contracts.ts',
  'src/local-owner/evidence.ts',
  'src/local-owner/verifier.ts',
  'src/local-owner/test.ts',
  'scripts/local-owner-proof.ts',
  'scripts/local-owner-proof-child.ts',
  'scripts/local-owner-legacy-race-child.ts',
  ...['decision', 'claim', 'status-event', 'start-intent', 'start-result']
    .map((kind) => `schemas/local-owner/${kind}.schema.json`),
];
const processCases = new Set([
  'two-overlapping-claims',
  'two-overlapping-starts',
  'restart-after-claim-before-intent',
  'concurrent-revoke-start',
  'revocation-before-handoff',
  'crash-after-intent-before-result',
  'legacy-insert-races-profile-admission',
]);
for (const [pin, file] of Object.entries(contractFiles)) {
  assert.equal(sha256(readFileSync(path.join(packetDir, file))), matrix.contract[pin], file);
  assert.equal(matrix.sourceHashes[`docs/contracts/local-owner-continuation/${file}`], matrix.contract[pin], file);
}

assert.equal(matrix.ciEvidence.runHeadCommit, matrix.implementation.headCommit, 'CI run implementation head');
assert.equal(matrix.independentLocalValidation.headCommit, matrix.implementation.headCommit, 'local rerun implementation head');
assert.equal(matrix.ciEvidence.checkoutTree, matrix.implementation.tree, 'CI checkout implementation tree');
assert.equal(sha256(proofBytes), matrix.ciEvidence.artifactResultSha256);
assert.equal(proof.schema, matrix.ciEvidence.artifactSchema);
assert.equal(proof.gitHead, matrix.ciEvidence.checkoutCommit);
assert.equal(proof.trackedDiffSha256, matrix.ciEvidence.trackedDiffSha256);
assert.equal(proof.trackedDiffSha256, sha256(''), 'CI proof must have no tracked changes');
assert.equal(matrix.ciEvidence.conclusion, 'success');
assert.equal(proof.testRun.passed, true);
assert.deepEqual(proof.contract, {
  commit: matrix.contract.sourceCommit,
  profileSha256: matrix.contract.profileSha256,
  fixturesSha256: matrix.contract.fixturesSha256,
  synthesisSha256: matrix.contract.synthesisSha256,
});
assert.equal(proof.evidenceIntegrity.defectSpecies, matrix.evidenceIntegrity.defectSpecies);
assert.equal(proof.evidenceIntegrity.rule, matrix.evidenceIntegrity.rule);
assert.equal(proof.providerCalls, matrix.ciEvidence.providerCalls, 'CI provider calls');
assert.equal(proof.networkCallbacks, matrix.ciEvidence.networkCallbacks, 'CI network callbacks');
assert.equal(proof.secretsExported, matrix.ciEvidence.secretsExported, 'CI secrets exported');
assert.equal(proof.providerCalls, 0);
assert.equal(proof.networkCallbacks, 0);
assert.equal(proof.secretsExported, false);
assert.equal(proof.testRun.outputSha256, matrix.ciEvidence.localOwnerTestOutputSha256);
assert.equal(proof.testRun.receiptCount, matrix.ciEvidence.unitReceipts);

assert.equal(sha256(localProofBytes), matrix.independentLocalValidation.proofResultSha256);
assert.equal(localProof.schema, matrix.ciEvidence.artifactSchema);
assert.equal(localProof.gitHead, matrix.independentLocalValidation.headCommit);
assert.equal(localProof.trackedDiffSha256, matrix.independentLocalValidation.trackedDiffSha256);
assert.equal(localProof.trackedDiffSha256, sha256(''), 'local rerun must have no tracked changes');
assert.equal(localProof.testRun.passed, true);
assert.equal(localProof.providerCalls, 0);
assert.equal(localProof.networkCallbacks, 0);
assert.equal(localProof.secretsExported, false);
assert.deepEqual(localProof.contract, proof.contract);

assert.deepEqual(Object.keys(matrix.sourceHashes).sort(), sourceFiles.sort(), 'complete v3 source inventory');
for (const [source, digest] of Object.entries(matrix.sourceHashes)) {
  assert.match(digest, /^[a-f0-9]{64}$/, source);
}
assert.deepEqual(proof.sourceHashes, matrix.sourceHashes, 'CI source hashes');
assert.deepEqual(localProof.sourceHashes, matrix.sourceHashes, 'local rerun source hashes');

assert.equal(fixtures.cases.length, 44);
assert.equal(matrix.cases.length, fixtures.cases.length);
assert.equal(proof.inventory.length, fixtures.cases.length);
assert.equal(localProof.inventory.length, fixtures.cases.length);

const counts = { unit: 0, process: 0 };
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
  const localObserved = localProof.inventory[index];
  assert.equal(localObserved.id, fixture.id, `local rerun ${fixture.id}`);
  assert.equal(localObserved.required, fixture.expected, `local rerun ${fixture.id}`);
  assert.equal(localObserved.status, 'observed', `local rerun ${fixture.id}`);
  assert.equal(localObserved.receipt.id, fixture.id, `local rerun ${fixture.id}`);
  assert.equal(localObserved.receipt.status, 'passed', `local rerun ${fixture.id}`);
  const receiptKind = processCases.has(fixture.id) ? 'process' : 'unit';
  assert.equal(entry.receiptKind, receiptKind, `receipt kind ${fixture.id}`);
  for (const [label, caseReceipt] of [['CI', receipt], ['local rerun', localObserved.receipt]]) {
    assert.equal(typeof caseReceipt.test, 'string', `${label} test ${fixture.id}`);
    assert.ok(caseReceipt.test.trim(), `${label} test ${fixture.id}`);
    if (receiptKind === 'process') {
      assert.ok(caseReceipt.evidence && typeof caseReceipt.evidence === 'object'
        && Object.keys(caseReceipt.evidence).length > 0, `${label} process evidence ${fixture.id}`);
      if (label === 'local rerun') {
        assert.match(entry.independentReceiptSha256, /^[a-f0-9]{64}$/,
          `local rerun process receipt digest ${fixture.id}`);
        assert.equal(sha256(JSON.stringify(caseReceipt)), entry.independentReceiptSha256,
          `local rerun process receipt ${fixture.id}`);
      }
    } else {
      assert.equal(Object.hasOwn(caseReceipt, 'evidence'), false, `${label} unit receipt ${fixture.id}`);
      assert.equal(Object.hasOwn(entry, 'independentReceiptSha256'), false,
        `unit matrix receipt ${fixture.id}`);
    }
  }
  counts[receiptKind] += 1;
  assert.equal(
    entry.receiptRef,
    `${matrix.ciEvidence.evidenceFile}#/inventory/${index}/receipt`,
    fixture.id,
  );
  assert.equal(entry.receiptSha256, sha256(JSON.stringify(receipt)), fixture.id);
}

assert.deepEqual(counts, {
  unit: matrix.ciEvidence.unitReceipts,
  process: matrix.ciEvidence.processReceipts,
});
assert.equal(proof.inventory.filter((entry) => entry.status !== 'observed').length, 0);
assert.equal(localProof.inventory.length, matrix.independentLocalValidation.inventoryCases);
assert.equal(localProof.inventory.filter((entry) => entry.status === 'observed').length, matrix.independentLocalValidation.observedCases);
assert.equal(localProof.inventory.filter((entry) => entry.status !== 'observed').length, matrix.independentLocalValidation.uncoveredCases);
assert.equal(localProof.testRun.receiptCount, matrix.independentLocalValidation.unitReceipts);
assert.equal(matrix.independentLocalValidation.unitReceipts, counts.unit);
assert.equal(matrix.independentLocalValidation.processReceipts, counts.process);

console.log(JSON.stringify({
  passed: true,
  artifactSha256: matrix.ciEvidence.artifactResultSha256,
  cases: matrix.cases.length,
  unitReceipts: counts.unit,
  processReceipts: counts.process,
}));
