import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Run the real CLI against disposable packet copies. Refresh artifact hashes
// when testing semantic defects so a checksum mismatch cannot mask the bug.
function validateCopy(mutate = () => {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'hacp-evidence-test-'));
  try {
    mkdirSync(path.join(dir, 'scripts'));
    mkdirSync(path.join(dir, 'docs/source-packets'), { recursive: true });
    const script = path.join(dir, 'scripts/validate-local-owner-evidence.mjs');
    cpSync(path.join(root, 'scripts/validate-local-owner-evidence.mjs'), script);
    const packetDir = path.join(dir, 'docs/source-packets/wits-v0');
    cpSync(path.join(root, 'docs/source-packets/wits-v0'), packetDir, { recursive: true });
    const matrixPath = path.join(packetDir, 'local-owner-profile-evidence-matrix.json');
    const matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));
    const editProof = (source, edit) => {
      const metadata = source === 'CI' ? matrix.ciEvidence : matrix.independentLocalValidation;
      const file = path.join(packetDir, metadata.evidenceFile);
      const proof = JSON.parse(readFileSync(file, 'utf8'));
      edit(proof, metadata);
      const bytes = JSON.stringify(proof, null, 2) + '\n';
      writeFileSync(file, bytes);
      metadata[source === 'CI' ? 'artifactResultSha256' : 'proofResultSha256'] = sha256(bytes);
      if (source === 'CI') {
        for (const [index, observed] of proof.inventory.entries()) {
          matrix.cases[index].receiptSha256 = sha256(JSON.stringify(observed.receipt));
        }
      }
    };
    mutate(matrix, editProof);
    writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + '\n');
    return spawnSync(process.execPath, [script], { encoding: 'utf8', timeout: 10_000 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rejects(name, mutate, message) {
  test(name, () => {
    const result = validateCopy(mutate);
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, message);
    assert.equal(result.stdout, '', 'invalid evidence must not report success');
  });
}

test('committed CI and independent receipts validate with distinct Git checkouts', () => {
  const result = validateCopy();
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    passed: true,
    artifactSha256: '02257303e5880cbc755da1ed310a6c1e6365f4ad5361695d29d67e678062d09d',
    cases: 44,
    unitReceipts: 37,
    processReceipts: 7,
  });
});

rejects('rejects relabeling evidence as another implementation', (matrix) => {
  matrix.implementation.headCommit = '0'.repeat(40);
}, /CI run implementation head/);

rejects('rejects CI metadata naming a different run head', (matrix) => {
  matrix.ciEvidence.runHeadCommit = '0'.repeat(40);
}, /CI run implementation head/);

rejects('rejects a repinned rerun against another head', (matrix, editProof) => {
  editProof('local', (proof, metadata) => {
    proof.gitHead = metadata.headCommit = '0'.repeat(40);
  });
}, /local rerun implementation head/);

rejects('rejects a different synthetic checkout tree', (matrix) => {
  matrix.ciEvidence.checkoutTree = '0'.repeat(40);
}, /CI checkout implementation tree/);

for (const source of ['CI', 'local']) {
  rejects(`rejects a repinned dirty ${source} proof`, (matrix, editProof) => {
    editProof(source, (proof, metadata) => {
      proof.trackedDiffSha256 = metadata.trackedDiffSha256 = sha256('tracked implementation change');
    });
  }, /must have no tracked changes/);

  rejects(`rejects ${source} source drift outside the original eight-file subset`, (matrix, editProof) => {
    editProof(source, (proof) => {
      proof.sourceHashes['src/local-owner/jcs.ts'] = '0'.repeat(64);
    });
  }, /source hashes/);

  rejects(`rejects a missing ${source} source hash`, (matrix, editProof) => {
    editProof(source, (proof) => {
      delete proof.sourceHashes['scripts/local-owner-proof-child.ts'];
    });
  }, /source hashes/);

  rejects(`rejects ${source} process receipts without process evidence`, (matrix, editProof) => {
    editProof(source, (proof) => {
      delete proof.inventory.find((entry) => entry.id === 'two-overlapping-claims').receipt.evidence;
    });
  }, /process evidence two-overlapping-claims/);

  rejects(`rejects an inconsistent ${source} unit count`, (matrix, editProof) => {
    editProof(source, (proof, metadata) => {
      proof.testRun.receiptCount = metadata.unitReceipts = 36;
    });
  }, /AssertionError/);
}

rejects('rejects removing a required binding from the matrix and both proofs', (matrix, editProof) => {
  const source = 'src/local-owner/verifier.ts';
  delete matrix.sourceHashes[source];
  for (const label of ['CI', 'local']) {
    editProof(label, (proof) => { delete proof.sourceHashes[source]; });
  }
}, /complete v3 source inventory/);

rejects('rejects swapped receipt kinds even when aggregate counts stay 37/7', (matrix) => {
  matrix.cases.find((entry) => entry.id === 'authenticated-happy-path').receiptKind = 'process';
  matrix.cases.find((entry) => entry.id === 'two-overlapping-claims').receiptKind = 'unit';
}, /receipt kind authenticated-happy-path/);
