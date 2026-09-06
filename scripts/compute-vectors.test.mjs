import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  buildConformancePackage, diagnosticCodes, digestRecord, loadValidators,
  schemaDiagnostics, validateCorpus, validateInput, validateManifest
} from './compute-vectors.mjs';

const validators = await loadValidators();
const packageData = await buildConformancePackage();
const manifest = JSON.parse(await readFile(
  new URL('../schemas/v0.3-candidate/fixtures/manifest.json', import.meta.url), 'utf8'
));
const artifacts = new Map(packageData.artifacts.map((item) => [item.path, item]));

function entriesFor(bundle) {
  return bundle.records.map((descriptor) => ({
    ...descriptor, record: structuredClone(artifacts.get(descriptor.path).record)
  }));
}

function codesFor(entries, bundleKind = 'explicit', declared = true) {
  return validateInput(entries, validators, {}, bundleKind, declared).then(diagnosticCodes);
}

function cloneManifest(edit) {
  const copy = structuredClone(manifest);
  edit(copy);
  return copy;
}

async function rejectsManifest(edit, pattern) {
  await assert.rejects(() => validateManifest(cloneManifest(edit)), pattern);
}

test('manifest v2 preserves candidate status and owner-ruled qualification', async () => {
  await validateManifest(manifest);
  assert.equal(manifest.schema, 'hacp.v0_3_candidate.conformance_manifest.v2');
  assert.equal(manifest.candidateStatus, true);
  assert.equal(manifest.nonChainInventory, true);
  assert.deepEqual(manifest.ownerRulings.secondImplementationQualification, {
    sourceIssue: 'https://github.com/joefeser/hacp/issues/47',
    candidatePromotion: 'independent_production_plus_cross_validation',
    fullRelease: 'bidirectional_production_and_consumption'
  });
  assert.equal(Object.hasOwn(manifest.reviewRequired, 'qualificationRule'), false);
});

test('all three declared bundles validate independently', async () => {
  assert.deepEqual(manifest.expectedValidBundles.map((item) => item.kind), [
    'successful_continuation', 'pre_start_stop', 'stop_decision_response'
  ]);
  for (const bundle of manifest.expectedValidBundles) {
    assert.deepEqual(await codesFor(entriesFor(bundle), bundle.kind, true), [], bundle.id);
  }
});

test('all 22 logical negatives fail with exact diagnostic sets', async () => {
  const result = await validateCorpus(manifest);
  assert.equal(result.expectedInvalid, 22);
  assert.equal(result.expectedValidBundles, 3);
  assert.equal(result.fixtureInventory, 11);
});

test('historical all-seven same-invocation inventory is not a valid chain', async () => {
  const success = entriesFor(manifest.expectedValidBundles[0]);
  const stop = entriesFor(manifest.expectedValidBundles[1]).find((item) => item.role === 'stop_response');
  stop.record.packetId = success.find((item) => item.role === 'task_packet').record.packetId;
  stop.record.decisionId = success.find((item) => item.role === 'authority_basis_decision').record.decisionId;
  stop.record.successorInvocationId = success.find((item) => item.role === 'agent_report').record.successorInvocationId;
  stop.record.digest = digestRecord('stop-response', stop.record);
  assert.deepEqual(await codesFor([...success, stop], 'explicit', false), [
    'STOP_AFTER_WORK', 'UNDECLARED_VALIDATION_INPUT'
  ]);
});

test('rehashing a stop onto the successful invocation still fails STOP_AFTER_WORK', async () => {
  const success = entriesFor(manifest.expectedValidBundles[0]);
  const stop = entriesFor(manifest.expectedValidBundles[1]).find((item) => item.role === 'stop_response');
  stop.record.packetId = success.find((item) => item.role === 'task_packet').record.packetId;
  stop.record.decisionId = success.find((item) => item.role === 'authority_basis_decision').record.decisionId;
  stop.record.successorInvocationId = success.find((item) => item.role === 'agent_report').record.successorInvocationId;
  stop.record.digest = digestRecord('stop-response', stop.record);
  assert.ok((await codesFor([...success, stop], 'explicit', false)).includes('STOP_AFTER_WORK'));
});

test('splicing a stop into a success bundle fails closed', async () => {
  const success = entriesFor(manifest.expectedValidBundles[0]);
  const stop = entriesFor(manifest.expectedValidBundles[1]).find((item) => item.role === 'stop_response');
  assert.deepEqual(await codesFor([...success, stop], 'explicit', false), [
    'STOP_AUTHORITY_BASIS_DECISION_MISMATCH', 'STOP_PACKET_MISMATCH', 'UNDECLARED_VALIDATION_INPUT'
  ]);
});

test('success-only records cannot be inserted into the stop bundle', async () => {
  const stop = entriesFor(manifest.expectedValidBundles[1]);
  const success = entriesFor(manifest.expectedValidBundles[0]);
  for (const role of ['consumption_receipt', 'continuation_context']) {
    const codes = await codesFor([...stop, success.find((item) => item.role === role)], 'explicit', false);
    assert.ok(codes.includes('UNDECLARED_VALIDATION_INPUT'), role);
  }
  const report = success.find((item) => item.role === 'agent_report');
  const stopRecord = stop.find((item) => item.role === 'stop_response').record;
  report.record.successorInvocationId = stopRecord.successorInvocationId;
  report.record.startEvidence.successorInvocationId = stopRecord.successorInvocationId;
  report.record.digest = digestRecord('agent-report', report.record);
  const codes = await codesFor([...stop, report], 'explicit', false);
  assert.ok(codes.includes('STOP_AFTER_WORK'));
  assert.ok(codes.includes('UNDECLARED_VALIDATION_INPUT'));
});

test('stop bundles require task and authority-basis records', async () => {
  for (const role of ['task_packet', 'authority_basis_decision']) {
    const bundle = entriesFor(manifest.expectedValidBundles[1]).filter((item) => item.role !== role);
    assert.ok((await codesFor(bundle, 'pre_start_stop', true)).includes('MISSING_REQUIRED_RECORD'), role);
  }
});

test('stop identifies the actual authority-basis decision in both stop bundles', async () => {
  for (const bundleIndex of [1, 2]) {
    const bundle = entriesFor(manifest.expectedValidBundles[bundleIndex]);
    const stop = bundle.find((item) => item.role === 'stop_response').record;
    stop.decisionId = 'decision_unrelated_authority_basis_001';
    stop.digest = digestRecord('stop-response', stop);
    const response = bundle.find((item) => item.role === 'response_decision')?.record;
    if (response) {
      response.decisionRequest.digest = stop.digest;
      response.digest = digestRecord('human-decision', response);
    }
    const codes = await codesFor(bundle, manifest.expectedValidBundles[bundleIndex].kind, true);
    assert.deepEqual(codes, ['STOP_AUTHORITY_BASIS_DECISION_MISMATCH']);
  }
});

test('response decision has distinct identity and exact stop binding', async () => {
  const reused = entriesFor(manifest.expectedValidBundles[2]);
  const authority = reused.find((item) => item.role === 'authority_basis_decision').record;
  const response = reused.find((item) => item.role === 'response_decision').record;
  response.decisionId = authority.decisionId;
  response.digest = digestRecord('human-decision', response);
  assert.ok((await codesFor(reused, 'stop_decision_response', true)).includes('RESPONSE_DECISION_ID_REUSE'));

  for (const mutate of [
    record => { record.decisionRequest.id = 'stop_wrong_001'; },
    record => { record.decisionRequest.digest.value = 'e'.repeat(64); }
  ]) {
    const bundle = entriesFor(manifest.expectedValidBundles[2]);
    const candidate = bundle.find((item) => item.role === 'response_decision').record;
    mutate(candidate);
    candidate.digest = digestRecord('human-decision', candidate);
    assert.ok((await codesFor(bundle, 'stop_decision_response', true)).includes('DECISION_REQUEST_MISMATCH'));
  }
});

test('response decision binds the exact bundle task packet', async () => {
  for (const mutate of [
    record => { record.packetId = 'taskpkt_unrelated_001'; },
    record => { record.packetDigest.value = 'd'.repeat(64); }
  ]) {
    const bundle = entriesFor(manifest.expectedValidBundles[2]);
    const response = bundle.find((item) => item.role === 'response_decision').record;
    mutate(response);
    response.digest = digestRecord('human-decision', response);
    assert.deepEqual(await codesFor(bundle, 'stop_decision_response', true), ['PACKET_REFERENCE_MISMATCH']);
  }
});

test('top-level stop digest mismatch fails closed', async () => {
  const bundle = entriesFor(manifest.expectedValidBundles[1]);
  bundle.find((item) => item.role === 'stop_response').record.digest.value = '0'.repeat(64);
  assert.deepEqual(await codesFor(bundle, 'pre_start_stop', true), ['DIGEST_MISMATCH']);
});

for (const item of packageData.artifacts) {
  test(`${item.role} schema remains closed`, () => {
    assert.ok(schemaDiagnostics(validators, { ...item.record, unknownAuthority: true }).length);
  });
}

test('manifest rejects unknown fields and wrong schema identifier', async () => {
  await rejectsManifest(value => { value.unknown = true; }, /MANIFEST_SCHEMA_INVALID/);
  await rejectsManifest(value => { value.schema = 'hacp.v0_3_candidate.conformance_manifest.v1'; }, /MANIFEST_SCHEMA_INVALID/);
});

test('manifest rejects duplicate, missing, and unknown bundles', async () => {
  await rejectsManifest(value => { value.expectedValidBundles.push(structuredClone(value.expectedValidBundles[0])); }, /MANIFEST_SCHEMA_INVALID|MANIFEST_DUPLICATE_BUNDLE/);
  await rejectsManifest(value => { value.expectedValidBundles.pop(); }, /MANIFEST_SCHEMA_INVALID|MANIFEST_BUNDLE_SET_INVALID/);
  await rejectsManifest(value => { value.expectedValidBundles[0].id = 'unknown'; }, /MANIFEST_SCHEMA_INVALID|MANIFEST_BUNDLE_SET_INVALID/);
});

test('manifest rejects malformed replacement and omission selectors', async () => {
  await rejectsManifest(value => { value.expectedInvalid[2].omittedRecordPaths = [value.expectedInvalid[2].replaceRecordPath]; }, /MANIFEST_OMISSION_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid[2].replaceRecordPath = 'valid\/success\/not-there.json'; }, /MANIFEST_REPLACEMENT_TARGET_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid[2].schema = 'agent-report.schema.json'; }, /MANIFEST_REPLACEMENT_KIND_INVALID/);
  await rejectsManifest(value => { delete value.expectedInvalid[2].baseBundle; }, /MANIFEST_SCHEMA_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid[2].records = []; }, /MANIFEST_SCHEMA_INVALID/);
  await rejectsManifest(value => {
    const item = value.expectedInvalid[2];
    delete item.path;
    delete item.schema;
    delete item.replaceRecordPath;
  }, /MANIFEST_SCHEMA_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid[2].baseBundle = 'unknown_bundle'; }, /MANIFEST_SCHEMA_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid[0].omittedRecordPaths = ['valid\/success\/not-there.json']; }, /MANIFEST_OMISSION_INVALID/);
});

test('manifest rejects unsafe, mismatched, and uncovered inventory paths', async () => {
  await rejectsManifest(value => { value.fixtureInventory[0].path = '..\/escape.json'; }, /MANIFEST_SCHEMA_INVALID|MANIFEST_PATH_INVALID/);
  await rejectsManifest(value => { value.fixtureInventory[0].schema = 'agent-report.schema.json'; }, /MANIFEST_BUNDLE_PATH_INVALID/);
  await rejectsManifest(value => { value.fixtureInventory.pop(); }, /MANIFEST_BUNDLE_PATH_INVALID|MANIFEST_UNCOVERED_VALID_FIXTURE/);
  await rejectsManifest(value => { value.fixtureInventory.push(structuredClone(value.fixtureInventory[0])); }, /MANIFEST_SCHEMA_INVALID|MANIFEST_DUPLICATE_INVENTORY_PATH/);
  await rejectsManifest(value => { value.expectedValidBundles[0].records[0].path = 'valid\/success\/unknown.json'; }, /MANIFEST_SCHEMA_INVALID|MANIFEST_BUNDLE_PATH_INVALID/);
});

test('manifest rejects duplicate roles, paths, and explicit records', async () => {
  await rejectsManifest(value => { value.expectedValidBundles[0].records[1].role = 'task_packet'; }, /MANIFEST_SCHEMA_INVALID|MANIFEST_BUNDLE_ROLES_INVALID/);
  await rejectsManifest(value => { value.expectedValidBundles[0].records[1].path = value.expectedValidBundles[0].records[0].path; }, /MANIFEST_SCHEMA_INVALID|MANIFEST_BUNDLE_DUPLICATE|MANIFEST_BUNDLE_PATH_INVALID/);
  await rejectsManifest(value => { value.expectedInvalid.at(-2).records.push(structuredClone(value.expectedInvalid.at(-2).records[0])); }, /MANIFEST_SCHEMA_INVALID|MANIFEST_EXPLICIT_DUPLICATE/);
});

test('standalone manifest schema rejects role/path combinations from another record', async () => {
  await rejectsManifest(value => {
    value.expectedValidBundles[0].records[0].path = 'valid/success/agent-report.valid.json';
  }, /MANIFEST_SCHEMA_INVALID/);
});

test('raw inventory and duplicate roles are undeclared inputs', async () => {
  const all = packageData.artifacts.map((item) => ({ role: item.role, path: item.path, record: structuredClone(item.record) }));
  const codes = await codesFor(all, 'explicit', false);
  assert.deepEqual(codes, [
    'DECISION_REQUEST_CHAIN_MISMATCH',
    'DECISION_REQUEST_MISMATCH',
    'DUPLICATE_RECORD_KIND',
    'DUPLICATE_RECORD_ROLE',
    'REPORT_DECISION_MISMATCH',
    'REPORT_DECISION_REQUEST_MISMATCH',
    'REPORT_PACKET_MISMATCH',
    'STALE_REPLAY',
    'UNDECLARED_VALIDATION_INPUT'
  ]);
  const success = entriesFor(manifest.expectedValidBundles[0]);
  const duplicateCodes = await codesFor([...success, structuredClone(success[0])], 'explicit', false);
  assert.ok(duplicateCodes.includes('DUPLICATE_RECORD_ROLE'));
  assert.ok(duplicateCodes.includes('DUPLICATE_RECORD_KIND'));
});

test('generated records contain no placeholder digest values', () => {
  const records = [
    ...packageData.artifacts.map((item) => item.record),
    ...packageData.invalidRecords.values()
  ];
  for (const record of records) {
    assert.doesNotMatch(JSON.stringify(record), /\"value\":\"([0-6])\1{63}\"/);
  }
});
