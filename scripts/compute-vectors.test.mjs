import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  buildValidRecords, digestRecord, digestEnvelope, loadValidators,
  schemaDiagnostics, validateSemantics
} from './compute-vectors.mjs';

const validators = await loadValidators();
const baseline = await buildValidRecords();
const manifest = JSON.parse(await readFile(
  new URL('../schemas/v0.3-candidate/fixtures/manifest.json', import.meta.url),
  'utf8',
));

test('manifest records the owner-ruled qualification without reopening it', () => {
  assert.equal(Object.hasOwn(manifest.reviewRequired, 'qualificationRule'), false);
  assert.deepEqual(manifest.ownerRulings.secondImplementationQualification, {
    sourceIssue: 'https://github.com/joefeser/hacp/issues/47',
    candidatePromotion: 'independent_production_plus_cross_validation',
    fullRelease: 'bidirectional_production_and_consumption',
  });
});

// Rebind every downstream digest after a mutation. A negative test must fail
// on the semantic defect, not a stale digest left behind by its setup.
function rehash(records) {
  const replacements = new Map();
  function rebind(value) {
    if (!value || typeof value !== 'object') return;
    if (value.value && replacements.has(value.value)) Object.assign(value, replacements.get(value.value));
    for (const child of Object.values(value)) rebind(child);
  }
  for (const kind of ['task-packet', 'review-finding', 'stop-response', 'human-decision',
    'consumption-receipt', 'continuation-context', 'agent-report']) {
    const record = records[kind];
    if (!record) continue;
    const previous = record.digest.value;
    rebind(record);
    if (record.startEvidence) {
      const input = structuredClone(record.startEvidence);
      delete input.digest;
      record.startEvidence.digest = digestEnvelope('org.hacp.successor-start-evidence.v0.3-candidate', input);
    }
    record.digest = digestRecord(kind, record);
    replacements.set(previous, record.digest);
  }
  return records;
}

function diagnostics(edit) {
  const records = structuredClone(baseline);
  edit(records);
  rehash(records);
  assert.deepEqual(Object.values(records).flatMap(record => schemaDiagnostics(validators, record)), []);
  return validateSemantics(records).map(item => item.code);
}

for (const kind of ['task-packet', 'human-decision', 'consumption-receipt', 'continuation-context', 'review-finding']) {
  test(`reject a continuation chain missing ${kind}`, () => {
    const codes = diagnostics(records => delete records[kind]);
    assert.ok(codes.includes(kind === 'review-finding' ? 'DECISION_REQUEST_MISMATCH' : 'MISSING_REQUIRED_RECORD'), codes);
  });
}

test('standalone task and pre-start receipt prefixes remain valid', () => {
  assert.deepEqual(diagnostics(records => {
    delete records['agent-report'];
    delete records['continuation-context'];
    delete records['stop-response'];
  }), []);
  assert.deepEqual(validateSemantics({ 'task-packet': baseline['task-packet'] }), []);
});

test('claim chronology is checked even before a report exists', () => {
  assert.deepEqual(diagnostics(records => {
    delete records['agent-report'];
    records['consumption-receipt'].claim.claimedAt = '2026-09-03T17:00:00Z';
  }), ['CLAIM_START_CHRONOLOGY_INVALID']);
});

for (const [kind, fields] of [
  ['human-decision', ['createdAt']],
  ['consumption-receipt', ['claim', 'claimedAt']],
  ['consumption-receipt', ['singleConsumerBasis', 'receiptExpiresAt']],
  ['agent-report', ['startEvidence', 'acceptedClaimReadBackAt']],
  ['agent-report', ['startEvidence', 'workStartedAt']],
  ['agent-report', ['returnedAt']]
]) {
  test(`unorderable leap second fails closed: ${fields.join('.')}`, () => {
    assert.deepEqual(diagnostics(records => {
      let target = records[kind];
      for (const key of fields.slice(0, -1)) target = target[key];
      target[fields.at(-1)] = '2025-12-31T23:59:60Z';
    }), ['TIMESTAMP_UNCOMPARABLE']);
  });
}

test('fractional precision cannot hide claim after readback', () => {
  assert.deepEqual(diagnostics(records => {
    records['consumption-receipt'].claim.claimedAt = '2026-09-03T18:05:01.0009Z';
    records['agent-report'].startEvidence.acceptedClaimReadBackAt = '2026-09-03T18:05:01.0001Z';
  }), ['CLAIM_START_CHRONOLOGY_INVALID']);
});

test('schema-accepted compact offsets preserve fractional chronology', () => {
  assert.deepEqual(diagnostics(records => {
    records['consumption-receipt'].claim.claimedAt = '2026-09-03T18:05:01.0009+0000';
    records['agent-report'].startEvidence.acceptedClaimReadBackAt = '2026-09-03T18:05:01.0001Z';
  }), ['CLAIM_START_CHRONOLOGY_INVALID']);
});

test('arbitrary fractional precision preserves valid expiry ordering', () => {
  assert.deepEqual(diagnostics(records => {
    records['agent-report'].startEvidence.workStartedAt = '2026-09-03T18:05:02.00000000000000000001Z';
    records['consumption-receipt'].singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:05:02.00000000000000000002Z';
  }), []);
});

test('fractional precision cannot hide expiry before start', () => {
  assert.deepEqual(diagnostics(records => {
    records['agent-report'].startEvidence.workStartedAt = '2026-09-03T18:05:02.00000000000000000002Z';
    records['consumption-receipt'].singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:05:02.00000000000000000001Z';
  }), ['EXPIRED_AT_START']);
});

test('offsets and equivalent fractional spellings compare as the same instant', () => {
  assert.deepEqual(diagnostics(records => {
    records['consumption-receipt'].claim.claimedAt = '2026-09-03T13:05:01.1-05:00';
    records['agent-report'].startEvidence.acceptedClaimReadBackAt = '2026-09-03T18:05:01.1000Z';
  }), []);
});

test('expiry equality at start is rejected', () => {
  assert.deepEqual(diagnostics(records => {
    records['consumption-receipt'].singleConsumerBasis.receiptExpiresAt = records['agent-report'].startEvidence.workStartedAt;
  }), ['EXPIRED_AT_START']);
});

test('report cannot return before its work starts', () => {
  assert.deepEqual(diagnostics(records => {
    records['agent-report'].returnedAt = '2026-09-03T18:04:00Z';
  }), ['REPORT_BEFORE_START']);
});

test('report may return at start or after receipt expiry as historical evidence', () => {
  for (const returnedAt of ['2026-09-03T18:05:02Z', '2026-09-04T18:05:02Z']) {
    assert.deepEqual(diagnostics(records => { records['agent-report'].returnedAt = returnedAt; }), []);
  }
});

for (const decision of ['reject', 'defer', 'return_for_clarification']) {
  test(`${decision} cannot authorize a consistently rehashed chain`, () => {
    assert.deepEqual(diagnostics(records => { records['human-decision'].decision = decision; }), ['NON_APPROVAL_DECISION']);
  });
}

for (const kind of Object.keys(baseline)) {
  test(`${kind} schema rejects an unknown top-level field`, () => {
    assert.ok(schemaDiagnostics(validators, { ...baseline[kind], unknownAuthority: true }).length);
  });
}

test('continuation schema rejects a stripped or unknown required extension', () => {
  for (const edit of [
    record => { delete record.requiredExtension; },
    record => { record.requiredExtension.profileId = 'unknown-profile'; },
    record => { record.requiredExtension.extensionAwareProcessingRequired = false; }
  ]) {
    const record = structuredClone(baseline['continuation-context']);
    edit(record);
    assert.ok(schemaDiagnostics(validators, record).length);
  }
});
