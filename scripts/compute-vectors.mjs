#!/usr/bin/env node

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import canonicalize from 'canonicalize';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;
const schemaRoot = path.join(repoRoot, 'schemas/v0.3-candidate');
const sourceRoot = path.join(repoRoot, 'docs/source-packets/wits-v0/examples');
const fixtureRoot = path.join(schemaRoot, 'fixtures');
const validRoot = path.join(fixtureRoot, 'valid');
const invalidRoot = path.join(fixtureRoot, 'invalid');

const recordKinds = [
  'task-packet',
  'review-finding',
  'human-decision',
  'consumption-receipt',
  'continuation-context',
  'agent-report',
  'stop-response'
];

// REVIEW-REQUIRED: these candidate domains are proposed inputs, not finalized
// protocol identifiers. Joe must approve them before candidate publication.
const domains = Object.freeze({
  'task-packet': 'org.hacp.task-packet.v0.3-candidate',
  'human-decision': 'org.hacp.human-decision.v0.3-candidate',
  'consumption-receipt': 'org.hacp.consumption-receipt.v0.3-candidate',
  'continuation-context': 'org.hacp.continuation-context.v0.3-candidate',
  'agent-report': 'org.hacp.agent-report.v0.3-candidate',
  'review-finding': 'org.hacp.review-finding.v0.3-candidate',
  'stop-response': 'org.hacp.stop-response.v0.3-candidate',
  'successor-start-evidence': 'org.hacp.successor-start-evidence.v0.3-candidate'
});

const kindFromRecord = Object.freeze({
  'hacp.v0_3_candidate.task_packet': 'task-packet',
  'hacp.v0_3_candidate.review_finding': 'review-finding',
  'hacp.v0_3_candidate.human_decision': 'human-decision',
  'hacp.v0_3_candidate.consumption_receipt': 'consumption-receipt',
  'hacp.v0_3_candidate.continuation_context': 'continuation-context',
  'hacp.v0_3_candidate.agent_report': 'agent-report',
  'hacp.v0_3_candidate.stop_response': 'stop-response'
});

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function digestEnvelope(domain, record) {
  const serialized = canonicalize({ domain, record });
  if (serialized === undefined) throw new Error('RFC 8785 JCS serialization failed.');
  return {
    algorithm: 'sha256',
    canonicalization: 'json-rfc8785-jcs',
    digestDomain: domain,
    value: createHash('sha256').update(serialized, 'utf8').digest('hex')
  };
}

function digestRecord(kind, record) {
  const withoutDigest = structuredClone(record);
  delete withoutDigest.digest;
  return digestEnvelope(domains[kind], withoutDigest);
}

function normalizeDigestReferences(value) {
  if (Array.isArray(value)) return value.map(normalizeDigestReferences);
  if (!value || typeof value !== 'object') return value;
  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, normalizeDigestReferences(child)])
  );
  if (normalized.algorithm === 'sha256' && normalized.digestDomain) {
    const legacyKind = String(normalized.digestDomain)
      .replace('_v0.3_candidate', '')
      .replaceAll('_', '-');
    if (domains[legacyKind]) normalized.digestDomain = domains[legacyKind];
  }
  return normalized;
}

function withDigest(kind, record) {
  const next = structuredClone(record);
  next.digest = digestRecord(kind, next);
  return next;
}

async function buildValidRecords() {
  const source = Object.fromEntries(await Promise.all(recordKinds.map(async (kind) => [
    kind,
    normalizeDigestReferences(await readJson(path.join(sourceRoot, `${kind}.candidate.json`)))
  ])));

  const task = withDigest('task-packet', source['task-packet']);

  const findingInput = structuredClone(source['review-finding']);
  findingInput.packetDigest = task.digest;
  const finding = withDigest('review-finding', findingInput);

  const decisionInput = structuredClone(source['human-decision']);
  decisionInput.packetDigest = task.digest;
  decisionInput.decisionRequest.digest = finding.digest;
  const decision = withDigest('human-decision', decisionInput);

  const receiptInput = structuredClone(source['consumption-receipt']);
  receiptInput.decisionDigest = decision.digest;
  receiptInput.decisionRequest.digest = finding.digest;
  const receipt = withDigest('consumption-receipt', receiptInput);

  const contextInput = structuredClone(source['continuation-context']);
  contextInput.decision.digest = decision.digest;
  contextInput.consumptionReceipt.digest = receipt.digest;
  const context = withDigest('continuation-context', contextInput);

  const reportInput = structuredClone(source['agent-report']);
  reportInput.continuationContext.digest = context.digest;
  reportInput.decision.digest = decision.digest;
  reportInput.decisionRequest.digest = finding.digest;
  reportInput.consumptionReceiptDigest = receipt.digest;
  reportInput.startEvidence.consumptionReceiptDigest = receipt.digest;
  const startEvidenceInput = structuredClone(reportInput.startEvidence);
  delete startEvidenceInput.digest;
  reportInput.startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], startEvidenceInput);
  const report = withDigest('agent-report', reportInput);

  const stop = withDigest('stop-response', source['stop-response']);

  return {
    'task-packet': task,
    'review-finding': finding,
    'human-decision': decision,
    'consumption-receipt': receipt,
    'continuation-context': context,
    'agent-report': report,
    'stop-response': stop
  };
}

function buildInvalidFixtures(valid) {
  const digestMismatch = structuredClone(valid['human-decision']);
  digestMismatch.digest.value = 'f'.repeat(64);

  const strippedContext = structuredClone(valid['agent-report']);
  delete strippedContext.continuationContext;

  const staleReplay = structuredClone(valid['continuation-context']);
  staleReplay.decision.digest.value = 'a'.repeat(64);
  staleReplay.digest = digestRecord('continuation-context', staleReplay);

  const expired = structuredClone(valid['consumption-receipt']);
  expired.singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:04:59Z';
  expired.digest = digestRecord('consumption-receipt', expired);

  const revoked = structuredClone(valid['consumption-receipt']);

  const scopeExpansion = structuredClone(valid['consumption-receipt']);
  scopeExpansion.claim.permittedScope.push('deploy');
  scopeExpansion.digest = digestRecord('consumption-receipt', scopeExpansion);

  const nonApproval = structuredClone(valid['human-decision']);
  nonApproval.decision = 'reject';
  nonApproval.digest = digestRecord('human-decision', nonApproval);

  const splicedReport = structuredClone(valid['agent-report']);
  splicedReport.packetId = 'taskpkt_unrelated_001';
  splicedReport.digest = digestRecord('agent-report', splicedReport);

  const splicedReportDecision = structuredClone(valid['agent-report']);
  splicedReportDecision.decision.id = 'decision_unrelated_001';
  splicedReportDecision.digest = digestRecord('agent-report', splicedReportDecision);

  const splicedReportRequest = structuredClone(valid['agent-report']);
  splicedReportRequest.decisionRequest.id = 'finding_unrelated_001';
  splicedReportRequest.digest = digestRecord('agent-report', splicedReportRequest);

  const loopExceeded = structuredClone(valid['task-packet']);
  loopExceeded.loopPolicy.counter = loopExceeded.loopPolicy.ceiling + 1;
  loopExceeded.digest = digestRecord('task-packet', loopExceeded);

  const loopCounterMismatch = structuredClone(valid['agent-report']);
  loopCounterMismatch.loopCounter += 1;
  loopCounterMismatch.digest = digestRecord('agent-report', loopCounterMismatch);

  const splicedStartEvidence = structuredClone(valid['agent-report']);
  splicedStartEvidence.startEvidence.successorInvocationId = 'invoke_unrelated_001';
  const splicedStartInput = structuredClone(splicedStartEvidence.startEvidence);
  delete splicedStartInput.digest;
  splicedStartEvidence.startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], splicedStartInput);
  splicedStartEvidence.digest = digestRecord('agent-report', splicedStartEvidence);

  const expiredBeforeStart = structuredClone(valid['consumption-receipt']);
  expiredBeforeStart.singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:05:01Z';
  expiredBeforeStart.digest = digestRecord('consumption-receipt', expiredBeforeStart);

  return {
    'human-decision.digest-mismatch.invalid.json': digestMismatch,
    'agent-report.stripped-context.invalid.json': strippedContext,
    'continuation-context.stale-replay.invalid.json': staleReplay,
    'consumption-receipt.expired.invalid.json': expired,
    'consumption-receipt.revoked.invalid.json': revoked,
    'consumption-receipt.scope-expansion.invalid.json': scopeExpansion,
    'human-decision.non-approval.invalid.json': nonApproval,
    'agent-report.spliced-authority.invalid.json': splicedReport,
    'agent-report.spliced-decision.invalid.json': splicedReportDecision,
    'agent-report.spliced-request.invalid.json': splicedReportRequest,
    'task-packet.loop-ceiling.invalid.json': loopExceeded,
    'agent-report.loop-counter.invalid.json': loopCounterMismatch,
    'agent-report.spliced-start-evidence.invalid.json': splicedStartEvidence,
    'consumption-receipt.expired-before-start.invalid.json': expiredBeforeStart
  };
}

function equalDigest(left, right) {
  return left?.algorithm === right?.algorithm
    && left?.canonicalization === right?.canonicalization
    && left?.digestDomain === right?.digestDomain
    && left?.value === right?.value;
}

function resolveDecisionRequest(request, finding, stop) {
  if (request?.kind === 'review_finding') return finding
    ? { id: finding.findingId, digest: finding.digest }
    : null;
  if (request?.kind === 'stop_response') return stop
    ? { id: stop.stopId, digest: stop.digest }
    : null;
  return null;
}

function decisionRequestMatches(request, finding, stop) {
  const target = resolveDecisionRequest(request, finding, stop);
  return Boolean(target && request.id === target.id && equalDigest(request.digest, target.digest));
}

function validateSemantics(records, context = {}) {
  const diagnostics = [];
  const add = (code, message) => diagnostics.push({ code, message });
  const task = records['task-packet'];
  const finding = records['review-finding'];
  const decision = records['human-decision'];
  const receipt = records['consumption-receipt'];
  const continuation = records['continuation-context'];
  const report = records['agent-report'];
  const stop = records['stop-response'];

  for (const [kind, record] of Object.entries(records)) {
    if (record?.digest && !equalDigest(record.digest, digestRecord(kind, record))) {
      add('DIGEST_MISMATCH', `${kind} digest does not match its domain-wrapped RFC 8785 JCS preimage.`);
    }
  }
  if (finding && task && (finding.packetId !== task.packetId || !equalDigest(finding.packetDigest, task.digest))) {
    add('PACKET_REFERENCE_MISMATCH', 'Review finding does not bind the current task packet.');
  }
  if (decision && task && (decision.packetId !== task.packetId || !equalDigest(decision.packetDigest, task.digest))) {
    add('PACKET_REFERENCE_MISMATCH', 'Human decision does not bind the current task packet.');
  }
  if (decision && !decisionRequestMatches(decision.decisionRequest, finding, stop)) {
    add('DECISION_REQUEST_MISMATCH', 'Human decision does not bind the selected current decision-request record.');
  }
  if (receipt && decision && (receipt.decisionId !== decision.decisionId || !equalDigest(receipt.decisionDigest, decision.digest))) {
    add('STALE_REPLAY', 'Consumption receipt does not bind the current human decision revision.');
  }
  if (receipt && !decisionRequestMatches(receipt.decisionRequest, finding, stop)) {
    add('DECISION_REQUEST_MISMATCH', 'Consumption receipt does not bind the selected current decision-request record.');
  }
  if (receipt && decision) {
    if (decision.decision !== 'approve_bounded_successor') {
      add('NON_APPROVAL_DECISION', 'A non-approval decision cannot authorize a consumption receipt.');
    }
    const approved = new Set(decision.approvedSuccessorScope);
    if (receipt.claim.permittedScope.some((item) => !approved.has(item))) {
      add('SCOPE_EXPANSION', 'Consumption receipt claim exceeds the approved successor scope.');
    }
    if (Date.parse(receipt.singleConsumerBasis.receiptExpiresAt) <= Date.parse(receipt.claim.claimedAt)) {
      add('EXPIRED_RECEIPT', 'Receipt expiry is not later than its claim time.');
    }
    if ((context.revokedDecisionDigests || []).includes(decision.digest.value)) {
      add('REVOCATION_STATUS_REJECTED', 'Trusted fixture context marks the exact decision revision revoked.');
    }
  }
  if (continuation && decision && (!equalDigest(continuation.decision.digest, decision.digest) || continuation.decision.id !== decision.decisionId)) {
    add('STALE_REPLAY', 'Continuation context references a stale or unknown human decision revision.');
  }
  if (continuation && receipt && (!equalDigest(continuation.consumptionReceipt.digest, receipt.digest) || continuation.consumptionReceipt.id !== receipt.receiptId || continuation.successorInvocationId !== receipt.claim.successorInvocationId)) {
    add('CONSUMPTION_REFERENCE_MISMATCH', 'Continuation context does not bind the accepted receipt and successor.');
  }
  if (report && continuation && (!equalDigest(report.continuationContext?.digest, continuation.digest) || report.continuationContext?.id !== continuation.contextId)) {
    add('STRIPPED_OR_MISMATCHED_CONTEXT', 'Agent report does not carry the required continuation context binding.');
  }
  if (report && task && report.packetId !== task.packetId) {
    add('REPORT_PACKET_MISMATCH', 'Agent report does not bind the current task packet.');
  }
  if (report && decision && (report.decision.id !== decision.decisionId || !equalDigest(report.decision.digest, decision.digest))) {
    add('REPORT_DECISION_MISMATCH', 'Agent report does not bind the current human decision revision.');
  }
  if (report && !decisionRequestMatches(report.decisionRequest, finding, stop)) {
    add('REPORT_DECISION_REQUEST_MISMATCH', 'Agent report does not bind the selected current decision-request record.');
  }
  if (report && receipt && (report.consumptionReceiptId !== receipt.receiptId || !equalDigest(report.consumptionReceiptDigest, receipt.digest) || report.successorInvocationId !== receipt.claim.successorInvocationId)) {
    add('CONSUMPTION_REFERENCE_MISMATCH', 'Agent report does not bind the accepted receipt and successor.');
  }
  if (task && task.loopPolicy.counter > task.loopPolicy.ceiling) {
    add('LOOP_CEILING_EXCEEDED', 'Task loop counter exceeds its declared ceiling.');
  }
  if (report && task && report.loopCounter !== task.loopPolicy.counter) {
    add('LOOP_COUNTER_MISMATCH', 'Agent report does not preserve the task loop counter.');
  }
  if (report?.startEvidence) {
    const startEvidenceInput = structuredClone(report.startEvidence);
    delete startEvidenceInput.digest;
    const expected = digestEnvelope(domains['successor-start-evidence'], startEvidenceInput);
    if (!equalDigest(report.startEvidence.digest, expected)) add('START_EVIDENCE_DIGEST_MISMATCH', 'Start evidence digest is invalid.');
    if (receipt && (
      report.startEvidence.successorInvocationId !== report.successorInvocationId
      || report.startEvidence.successorInvocationId !== receipt.claim.successorInvocationId
      || report.startEvidence.consumptionReceiptId !== report.consumptionReceiptId
      || report.startEvidence.consumptionReceiptId !== receipt.receiptId
      || !equalDigest(report.startEvidence.consumptionReceiptDigest, report.consumptionReceiptDigest)
      || !equalDigest(report.startEvidence.consumptionReceiptDigest, receipt.digest)
    )) {
      add('START_EVIDENCE_BINDING_MISMATCH', 'Start evidence does not bind the accepted receipt and reported successor.');
    }
    if (Date.parse(report.startEvidence.acceptedClaimReadBackAt) > Date.parse(report.startEvidence.workStartedAt)) {
      add('CLAIM_AFTER_START', 'Accepted claim readback occurs after work start.');
    }
    if (receipt) {
      const expiresAt = Date.parse(receipt.singleConsumerBasis.receiptExpiresAt);
      if (expiresAt <= Date.parse(report.startEvidence.acceptedClaimReadBackAt)
        || expiresAt <= Date.parse(report.startEvidence.workStartedAt)) {
        add('EXPIRED_AT_START', 'Receipt was not valid through accepted-claim readback and successor start.');
      }
    }
  }
  if (stop && stop.successorWorkBegan !== false) add('STOP_AFTER_WORK', 'Candidate stop response cannot assert successor work began.');
  return diagnostics;
}

async function loadValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schemaFiles = (await readdir(schemaRoot)).filter((file) => file.endsWith('.schema.json')).sort();
  const schemas = {};
  for (const file of schemaFiles) schemas[file] = await readJson(path.join(schemaRoot, file));
  ajv.addSchema(schemas['common-defs.schema.json']);
  for (const kind of recordKinds) ajv.addSchema(schemas[`${kind}.schema.json`]);
  return Object.fromEntries(recordKinds.map((kind) => [kind, ajv.getSchema(schemas[`${kind}.schema.json`].$id)]));
}

function schemaDiagnostics(validators, record) {
  const kind = kindFromRecord[record?.recordKind];
  if (!kind) return [{ code: 'UNKNOWN_RECORD_KIND', message: `Unknown record kind ${record?.recordKind ?? '<missing>'}.` }];
  const validate = validators[kind];
  if (validate(record)) return [];
  return (validate.errors || []).map((error) => ({
    code: 'SCHEMA_VALIDATION_FAILED',
    message: `${error.instancePath || '/'} ${error.message}`,
    keyword: error.keyword
  }));
}

async function expectedOutputs() {
  const valid = await buildValidRecords();
  const invalid = buildInvalidFixtures(valid);
  const outputs = new Map();
  for (const [kind, record] of Object.entries(valid)) {
    outputs.set(path.join(validRoot, `${kind}.valid.json`), stableJson(record));
    outputs.set(path.join(sourceRoot, `${kind}.candidate.json`), stableJson(record));
  }
  for (const [file, record] of Object.entries(invalid)) outputs.set(path.join(invalidRoot, file), stableJson(record));
  const manifest = {
    schema: 'hacp.v0_3_candidate.conformance_manifest.v1',
    candidateStatus: true,
    sourceCommit: 'db47da2118355683f34fd955083c2b3c38769fe4',
    whoDecidesEvidence: {
      reviewedHead: 'e47515f8b66a318966233fbf416da0b130650ede',
      mergeCommit: 'c6677da198c166079132ac2a23a39afeade26af3',
      inspectedMainAtPreparation: '04a89f5509035b3299bb3786da1e9909a4e78dc0'
    },
    reviewRequired: {
      digestDomains: Object.values(domains),
      qualificationRule: 'UNRESOLVED: independent production plus cross-validation versus bidirectional production'
    },
    expectedValid: recordKinds.map((kind) => ({ path: `valid/${kind}.valid.json`, schema: `${kind}.schema.json` })),
    expectedInvalid: [
      { path: 'invalid/human-decision.digest-mismatch.invalid.json', schema: 'human-decision.schema.json', expectedCode: 'DIGEST_MISMATCH' },
      { path: 'invalid/agent-report.stripped-context.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'SCHEMA_VALIDATION_FAILED' },
      { path: 'invalid/continuation-context.stale-replay.invalid.json', schema: 'continuation-context.schema.json', expectedCode: 'STALE_REPLAY' },
      { path: 'invalid/consumption-receipt.expired.invalid.json', schema: 'consumption-receipt.schema.json', expectedCode: 'EXPIRED_RECEIPT' },
      { path: 'invalid/consumption-receipt.revoked.invalid.json', schema: 'consumption-receipt.schema.json', expectedCode: 'REVOCATION_STATUS_REJECTED', context: { revokedDecisionDigests: [valid['human-decision'].digest.value] } },
      { path: 'invalid/consumption-receipt.scope-expansion.invalid.json', schema: 'consumption-receipt.schema.json', expectedCode: 'SCOPE_EXPANSION' },
      { path: 'invalid/human-decision.non-approval.invalid.json', schema: 'human-decision.schema.json', expectedCode: 'NON_APPROVAL_DECISION' },
      { path: 'invalid/agent-report.spliced-authority.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'REPORT_PACKET_MISMATCH' },
      { path: 'invalid/agent-report.spliced-decision.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'REPORT_DECISION_MISMATCH' },
      { path: 'invalid/agent-report.spliced-request.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'REPORT_DECISION_REQUEST_MISMATCH' },
      { path: 'invalid/task-packet.loop-ceiling.invalid.json', schema: 'task-packet.schema.json', expectedCode: 'LOOP_CEILING_EXCEEDED' },
      { path: 'invalid/agent-report.loop-counter.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'LOOP_COUNTER_MISMATCH' },
      { path: 'invalid/agent-report.spliced-start-evidence.invalid.json', schema: 'agent-report.schema.json', expectedCode: 'START_EVIDENCE_BINDING_MISMATCH' },
      { path: 'invalid/consumption-receipt.expired-before-start.invalid.json', schema: 'consumption-receipt.schema.json', expectedCode: 'EXPIRED_AT_START' }
    ]
  };
  outputs.set(path.join(fixtureRoot, 'manifest.json'), stableJson(manifest));
  return { valid, invalid, manifest, outputs };
}

async function writeOutputs(outputs) {
  await mkdir(validRoot, { recursive: true });
  await mkdir(invalidRoot, { recursive: true });
  for (const [file, content] of outputs) await writeFile(file, content);
}

async function checkOutputs(outputs) {
  const drift = [];
  for (const [file, content] of outputs) {
    let actual;
    try { actual = await readFile(file, 'utf8'); } catch { actual = null; }
    if (actual !== content) drift.push(path.relative(repoRoot, file));
  }
  if (drift.length > 0) throw new Error(`Generated candidate vectors are stale or missing: ${drift.join(', ')}`);
  for (const kind of recordKinds) {
    const source = await readFile(path.join(sourceRoot, `${kind}.candidate.json`), 'utf8');
    if (/"value": "([0-6])\1{63}"/.test(source)) {
      throw new Error(`${kind} historical example still contains a placeholder digest.`);
    }
  }
}

async function validateCorpus(valid, manifest) {
  const knownAnswer = createHash('sha256').update(canonicalize({
    domain: 'org.hacp.local-owner-continuation.decision.0.1-candidate',
    record: {
      decisionId: 'decision-example-001',
      issuerId: 'issuer-example',
      profileId: 'org.hacp.local-owner-continuation',
      profileVersion: '0.1-candidate',
      recordKind: 'decision'
    }
  }), 'utf8').digest('hex');
  if (knownAnswer !== '9de745ae777609863f309450a0455da5ad7a1d166f8f29734d8a2d35d569f014') {
    throw new Error('RFC 8785 JCS known-answer vector failed.');
  }
  const validators = await loadValidators();
  const validDiagnostics = [];
  for (const record of Object.values(valid)) validDiagnostics.push(...schemaDiagnostics(validators, record));
  validDiagnostics.push(...validateSemantics(valid));
  if (validDiagnostics.length > 0) throw new Error(`Expected-valid corpus failed: ${JSON.stringify(validDiagnostics)}`);

  const stopOrigin = structuredClone(valid);
  stopOrigin['human-decision'].decisionRequest = {
    kind: 'stop_response',
    id: valid['stop-response'].stopId,
    digest: valid['stop-response'].digest
  };
  stopOrigin['human-decision'].digest = digestRecord('human-decision', stopOrigin['human-decision']);
  stopOrigin['consumption-receipt'].decisionDigest = stopOrigin['human-decision'].digest;
  stopOrigin['consumption-receipt'].decisionRequest = structuredClone(stopOrigin['human-decision'].decisionRequest);
  stopOrigin['consumption-receipt'].digest = digestRecord('consumption-receipt', stopOrigin['consumption-receipt']);
  stopOrigin['continuation-context'].decision.digest = stopOrigin['human-decision'].digest;
  stopOrigin['continuation-context'].consumptionReceipt.digest = stopOrigin['consumption-receipt'].digest;
  stopOrigin['continuation-context'].digest = digestRecord('continuation-context', stopOrigin['continuation-context']);
  stopOrigin['agent-report'].decision.digest = stopOrigin['human-decision'].digest;
  stopOrigin['agent-report'].decisionRequest = structuredClone(stopOrigin['human-decision'].decisionRequest);
  stopOrigin['agent-report'].consumptionReceiptDigest = stopOrigin['consumption-receipt'].digest;
  stopOrigin['agent-report'].continuationContext.digest = stopOrigin['continuation-context'].digest;
  stopOrigin['agent-report'].startEvidence.consumptionReceiptDigest = stopOrigin['consumption-receipt'].digest;
  const stopOriginStart = structuredClone(stopOrigin['agent-report'].startEvidence);
  delete stopOriginStart.digest;
  stopOrigin['agent-report'].startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], stopOriginStart);
  stopOrigin['agent-report'].digest = digestRecord('agent-report', stopOrigin['agent-report']);
  const stopOriginDiagnostics = [];
  for (const record of Object.values(stopOrigin)) stopOriginDiagnostics.push(...schemaDiagnostics(validators, record));
  stopOriginDiagnostics.push(...validateSemantics(stopOrigin));
  if (stopOriginDiagnostics.length > 0) {
    throw new Error(`Stop-response decision-request chain failed: ${JSON.stringify(stopOriginDiagnostics)}`);
  }

  for (const entry of manifest.expectedInvalid) {
    const invalidRecord = await readJson(path.join(fixtureRoot, entry.path));
    const kind = kindFromRecord[invalidRecord.recordKind];
    const records = { ...valid, [kind]: invalidRecord };
    const diagnostics = [
      ...schemaDiagnostics(validators, invalidRecord),
      ...validateSemantics(records, entry.context || {})
    ];
    if (!diagnostics.some((item) => item.code === entry.expectedCode)) {
      throw new Error(`${entry.path} did not fail with ${entry.expectedCode}: ${JSON.stringify(diagnostics)}`);
    }
  }
  return {
    schemas: recordKinds.length,
    expectedValid: manifest.expectedValid.length,
    expectedInvalid: manifest.expectedInvalid.length,
    digestAlgorithm: 'sha256',
    canonicalization: 'RFC 8785 JCS',
    candidateOnly: true,
    reviewRequired: ['digest domains', 'qualification rule']
  };
}

try {
  const generated = await expectedOutputs();
  if (writeMode) await writeOutputs(generated.outputs);
  if (checkMode) await checkOutputs(generated.outputs);
  const result = await validateCorpus(generated.valid, generated.manifest);
  process.stdout.write(`${JSON.stringify({ ok: true, ...result }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: error.message }, null, 2)}\n`);
  process.exitCode = 1;
}
