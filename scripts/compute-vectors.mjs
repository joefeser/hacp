#!/usr/bin/env node

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import canonicalize from 'canonicalize';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;
const schemaRoot = path.join(repoRoot, 'schemas/v0.3-candidate');
const manifestSchemaPath = path.join(schemaRoot, 'package/conformance-manifest.schema.json');
const sourceRoot = path.join(repoRoot, 'docs/source-packets/wits-v0/examples');
const fixtureRoot = path.join(schemaRoot, 'fixtures');
const validRoot = path.join(fixtureRoot, 'valid');
const invalidRoot = path.join(fixtureRoot, 'invalid');

const recordKinds = Object.freeze([
  'task-packet',
  'review-finding',
  'human-decision',
  'consumption-receipt',
  'continuation-context',
  'agent-report',
  'stop-response'
]);

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

const bundleRoles = Object.freeze({
  successful_continuation: Object.freeze([
    'task_packet', 'decision_request', 'authority_basis_decision',
    'consumption_receipt', 'continuation_context', 'agent_report'
  ]),
  pre_start_stop: Object.freeze([
    'task_packet', 'decision_request', 'authority_basis_decision', 'stop_response'
  ]),
  stop_decision_response: Object.freeze([
    'task_packet', 'decision_request', 'authority_basis_decision',
    'stop_response', 'response_decision'
  ])
});

const obsoleteGeneratedPaths = Object.freeze([
  ...recordKinds.map((kind) => path.join(validRoot, `${kind}.valid.json`)),
  path.join(invalidRoot, 'agent-report.missing-context-record.invalid.json'),
  path.join(invalidRoot, 'agent-report.missing-decision-record.invalid.json')
]);

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

function replaceExactStrings(value, replacements) {
  if (typeof value === 'string') return replacements[value] ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceExactStrings(item, replacements));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, replaceExactStrings(child, replacements)])
  );
}

function withDigest(kind, record) {
  const next = structuredClone(record);
  next.digest = digestRecord(kind, next);
  return next;
}

function artifact(role, fixturePath, record) {
  return Object.freeze({ role, path: fixturePath, record });
}

async function loadSourceExamples() {
  return Object.fromEntries(await Promise.all(recordKinds.map(async (kind) => [
    kind,
    normalizeDigestReferences(await readJson(path.join(sourceRoot, `${kind}.candidate.json`)))
  ])));
}

async function buildConformancePackage() {
  const source = await loadSourceExamples();

  const successTask = withDigest('task-packet', source['task-packet']);
  const successFindingInput = structuredClone(source['review-finding']);
  successFindingInput.packetDigest = successTask.digest;
  const successFinding = withDigest('review-finding', successFindingInput);
  const successDecisionInput = structuredClone(source['human-decision']);
  successDecisionInput.packetDigest = successTask.digest;
  successDecisionInput.decisionRequest.digest = successFinding.digest;
  const successDecision = withDigest('human-decision', successDecisionInput);
  const successReceiptInput = structuredClone(source['consumption-receipt']);
  successReceiptInput.decisionDigest = successDecision.digest;
  successReceiptInput.decisionRequest.digest = successFinding.digest;
  const successReceipt = withDigest('consumption-receipt', successReceiptInput);
  const successContextInput = structuredClone(source['continuation-context']);
  successContextInput.decision.digest = successDecision.digest;
  successContextInput.consumptionReceipt.digest = successReceipt.digest;
  const successContext = withDigest('continuation-context', successContextInput);
  const successReportInput = structuredClone(source['agent-report']);
  successReportInput.continuationContext.digest = successContext.digest;
  successReportInput.decision.digest = successDecision.digest;
  successReportInput.decisionRequest.digest = successFinding.digest;
  successReportInput.consumptionReceiptDigest = successReceipt.digest;
  successReportInput.startEvidence.consumptionReceiptDigest = successReceipt.digest;
  const successStartInput = structuredClone(successReportInput.startEvidence);
  delete successStartInput.digest;
  successReportInput.startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], successStartInput);
  const successReport = withDigest('agent-report', successReportInput);

  const stopIds = {
    taskpkt_example_continue_review_001: 'taskpkt_example_pre_start_stop_001',
    finding_example_needs_owner_decision_001: 'finding_example_stop_authority_basis_001',
    decision_example_approve_successor_001: 'decision_example_stop_authority_basis_001',
    invoke_example_docs_worker_001: 'invoke_example_stopped_worker_001',
    stop_example_missing_receipt_001: 'stop_example_pre_start_001'
  };
  const stopTask = withDigest('task-packet', replaceExactStrings(source['task-packet'], stopIds));
  const stopFindingInput = replaceExactStrings(source['review-finding'], stopIds);
  stopFindingInput.packetDigest = stopTask.digest;
  const stopFinding = withDigest('review-finding', stopFindingInput);
  const stopDecisionInput = replaceExactStrings(source['human-decision'], stopIds);
  stopDecisionInput.packetDigest = stopTask.digest;
  stopDecisionInput.decisionRequest.digest = stopFinding.digest;
  stopDecisionInput.decisionReason = 'The bounded continuation was approved, but its required admission receipt could not be established.';
  const stopDecision = withDigest('human-decision', stopDecisionInput);
  const stopInput = replaceExactStrings(source['stop-response'], stopIds);
  stopInput.stopReason = 'MISSING_AUTHORITY';
  stopInput.whatDoesNotLineUp = 'The presented decision did not have a readable accepted consumption receipt for this successor invocation.';
  stopInput.boundaryStatement = 'The stop records a candidate no-start assertion for this invocation; it does not prove execution absence outside the declared evidence boundary.';
  const stopResponse = withDigest('stop-response', stopInput);

  const responseDecisionInput = structuredClone(stopDecision);
  responseDecisionInput.decisionId = 'decision_example_respond_to_stop_001';
  responseDecisionInput.decisionRequest = {
    kind: 'stop_response',
    id: stopResponse.stopId,
    digest: stopResponse.digest
  };
  responseDecisionInput.decision = 'defer';
  responseDecisionInput.decisionReason = 'The owner defers continuation until an authentic current admission receipt is available.';
  responseDecisionInput.createdAt = '2026-09-03T18:02:00Z';
  responseDecisionInput.evidenceRefs = ['evidence://example/pre-start-stop-review'];
  responseDecisionInput.boundaryStatement = 'This response records a human deferral only. It grants no successor authority and consumes no decision.';
  const responseDecision = withDigest('human-decision', responseDecisionInput);

  const artifacts = [
    artifact('task_packet', 'valid/success/task-packet.valid.json', successTask),
    artifact('decision_request', 'valid/success/review-finding.valid.json', successFinding),
    artifact('authority_basis_decision', 'valid/success/human-decision.valid.json', successDecision),
    artifact('consumption_receipt', 'valid/success/consumption-receipt.valid.json', successReceipt),
    artifact('continuation_context', 'valid/success/continuation-context.valid.json', successContext),
    artifact('agent_report', 'valid/success/agent-report.valid.json', successReport),
    artifact('task_packet', 'valid/stop/task-packet.valid.json', stopTask),
    artifact('decision_request', 'valid/stop/review-finding.valid.json', stopFinding),
    artifact('authority_basis_decision', 'valid/stop/authority-basis-decision.valid.json', stopDecision),
    artifact('stop_response', 'valid/stop/stop-response.valid.json', stopResponse),
    artifact('response_decision', 'valid/stop/response-decision.valid.json', responseDecision)
  ];

  const byPath = new Map(artifacts.map((item) => [item.path, item]));
  const recordsFor = (...paths) => paths.map((fixturePath) => {
    const item = byPath.get(fixturePath);
    if (!item) throw new Error(`Unknown generated fixture path ${fixturePath}.`);
    return { role: item.role, path: item.path };
  });
  const bundles = [
    {
      id: 'successful_continuation',
      kind: 'successful_continuation',
      records: recordsFor(...artifacts.slice(0, 6).map((item) => item.path))
    },
    {
      id: 'pre_start_stop',
      kind: 'pre_start_stop',
      records: recordsFor(...artifacts.slice(6, 10).map((item) => item.path))
    },
    {
      id: 'stop_decision_response',
      kind: 'stop_decision_response',
      records: recordsFor(...artifacts.slice(6, 11).map((item) => item.path))
    }
  ];

  const success = Object.fromEntries(artifacts.slice(0, 6).map((item) => [item.role, item.record]));
  const stop = Object.fromEntries(artifacts.slice(6, 11).map((item) => [item.role, item.record]));
  const invalidRecords = buildInvalidFixtures(success, stop);
  const expectedInvalid = buildInvalidManifest(success, stop, invalidRecords, bundles);
  const manifest = {
    schema: 'hacp.v0_3_candidate.conformance_manifest.v2',
    candidateStatus: true,
    sourcePacketCommit: 'db47da2118355683f34fd955083c2b3c38769fe4',
    regenerationBaseCommit: '73056a53fd87ce20d6a40f8c2188d2fb0a07ce7f',
    whoDecidesEvidence: {
      reviewedHead: 'e47515f8b66a318966233fbf416da0b130650ede',
      mergeCommit: 'c6677da198c166079132ac2a23a39afeade26af3',
      inspectedMainAtPreparation: '04a89f5509035b3299bb3786da1e9909a4e78dc0'
    },
    reviewRequired: { digestDomains: Object.values(domains) },
    ownerRulings: {
      secondImplementationQualification: {
        sourceIssue: 'https://github.com/joefeser/hacp/issues/47',
        candidatePromotion: 'independent_production_plus_cross_validation',
        fullRelease: 'bidirectional_production_and_consumption'
      }
    },
    nonChainInventory: true,
    fixtureInventory: artifacts.map((item) => ({
      path: item.path,
      schema: `${kindFromRecord[item.record.recordKind]}.schema.json`
    })),
    expectedValidBundles: bundles,
    expectedInvalid
  };

  return { artifacts, bundles, invalidRecords, manifest };
}

function buildInvalidFixtures(success, stop) {
  const digestMismatch = structuredClone(success.authority_basis_decision);
  digestMismatch.digest.value = 'f'.repeat(64);
  const strippedContext = structuredClone(success.agent_report);
  delete strippedContext.continuationContext;
  strippedContext.digest = digestRecord('agent-report', strippedContext);
  const staleReplay = structuredClone(success.continuation_context);
  staleReplay.decision.digest.value = 'a'.repeat(64);
  staleReplay.digest = digestRecord('continuation-context', staleReplay);
  const expired = structuredClone(success.consumption_receipt);
  expired.singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:04:59Z';
  expired.digest = digestRecord('consumption-receipt', expired);
  const revoked = structuredClone(success.consumption_receipt);
  const scopeExpansion = structuredClone(success.consumption_receipt);
  scopeExpansion.claim.permittedScope.push('deploy');
  scopeExpansion.digest = digestRecord('consumption-receipt', scopeExpansion);
  const nonApproval = structuredClone(success.authority_basis_decision);
  nonApproval.decision = 'reject';
  nonApproval.digest = digestRecord('human-decision', nonApproval);
  const splicedReport = structuredClone(success.agent_report);
  splicedReport.packetId = 'taskpkt_unrelated_001';
  splicedReport.digest = digestRecord('agent-report', splicedReport);
  const splicedReportDecision = structuredClone(success.agent_report);
  splicedReportDecision.decision.id = 'decision_unrelated_001';
  splicedReportDecision.digest = digestRecord('agent-report', splicedReportDecision);
  const splicedReportRequest = structuredClone(success.agent_report);
  splicedReportRequest.decisionRequest.id = 'finding_unrelated_001';
  splicedReportRequest.digest = digestRecord('agent-report', splicedReportRequest);
  const loopExceeded = structuredClone(success.task_packet);
  loopExceeded.loopPolicy.counter = loopExceeded.loopPolicy.ceiling + 1;
  loopExceeded.digest = digestRecord('task-packet', loopExceeded);
  const loopCounterMismatch = structuredClone(success.agent_report);
  loopCounterMismatch.loopCounter += 1;
  loopCounterMismatch.digest = digestRecord('agent-report', loopCounterMismatch);
  const splicedStartEvidence = structuredClone(success.agent_report);
  splicedStartEvidence.startEvidence.successorInvocationId = 'invoke_unrelated_001';
  const splicedStartInput = structuredClone(splicedStartEvidence.startEvidence);
  delete splicedStartInput.digest;
  splicedStartEvidence.startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], splicedStartInput);
  splicedStartEvidence.digest = digestRecord('agent-report', splicedStartEvidence);
  const expiredBeforeStart = structuredClone(success.consumption_receipt);
  expiredBeforeStart.singleConsumerBasis.receiptExpiresAt = '2026-09-03T18:05:01Z';
  expiredBeforeStart.digest = digestRecord('consumption-receipt', expiredBeforeStart);
  const claimAfterStart = structuredClone(success.consumption_receipt);
  claimAfterStart.claim.claimedAt = '2026-09-03T18:06:00Z';
  claimAfterStart.digest = digestRecord('consumption-receipt', claimAfterStart);
  const divergentDecisionRequest = structuredClone(success.consumption_receipt);
  divergentDecisionRequest.decisionRequest = {
    kind: 'stop_response',
    id: stop.stop_response.stopId,
    digest: stop.stop_response.digest
  };
  divergentDecisionRequest.digest = digestRecord('consumption-receipt', divergentDecisionRequest);
  const splicedStop = structuredClone(stop.stop_response);
  splicedStop.packetId = 'taskpkt_unrelated_001';
  splicedStop.digest = digestRecord('stop-response', splicedStop);
  const leapSecondExpiry = structuredClone(success.consumption_receipt);
  leapSecondExpiry.singleConsumerBasis.receiptExpiresAt = '2025-12-31T23:59:60Z';
  leapSecondExpiry.digest = digestRecord('consumption-receipt', leapSecondExpiry);
  const fractionalClaim = structuredClone(success.consumption_receipt);
  fractionalClaim.claim.claimedAt = '2026-09-03T18:05:01.0001Z';
  fractionalClaim.digest = digestRecord('consumption-receipt', fractionalClaim);
  const reportBeforeStart = structuredClone(success.agent_report);
  reportBeforeStart.returnedAt = '2026-09-03T18:04:00Z';
  reportBeforeStart.digest = digestRecord('agent-report', reportBeforeStart);

  return new Map(Object.entries({
    'invalid/consumption-receipt.leap-second-expiry.invalid.json': leapSecondExpiry,
    'invalid/consumption-receipt.fractional-claim-order.invalid.json': fractionalClaim,
    'invalid/agent-report.return-before-start.invalid.json': reportBeforeStart,
    'invalid/human-decision.digest-mismatch.invalid.json': digestMismatch,
    'invalid/agent-report.stripped-context.invalid.json': strippedContext,
    'invalid/continuation-context.stale-replay.invalid.json': staleReplay,
    'invalid/consumption-receipt.expired.invalid.json': expired,
    'invalid/consumption-receipt.revoked.invalid.json': revoked,
    'invalid/consumption-receipt.scope-expansion.invalid.json': scopeExpansion,
    'invalid/human-decision.non-approval.invalid.json': nonApproval,
    'invalid/agent-report.spliced-authority.invalid.json': splicedReport,
    'invalid/agent-report.spliced-decision.invalid.json': splicedReportDecision,
    'invalid/agent-report.spliced-request.invalid.json': splicedReportRequest,
    'invalid/task-packet.loop-ceiling.invalid.json': loopExceeded,
    'invalid/agent-report.loop-counter.invalid.json': loopCounterMismatch,
    'invalid/agent-report.spliced-start-evidence.invalid.json': splicedStartEvidence,
    'invalid/consumption-receipt.expired-before-start.invalid.json': expiredBeforeStart,
    'invalid/consumption-receipt.claim-after-start.invalid.json': claimAfterStart,
    'invalid/consumption-receipt.divergent-request.invalid.json': divergentDecisionRequest,
    'invalid/stop-response.spliced-packet.invalid.json': splicedStop
  }));
}

function buildInvalidManifest(success, stop) {
  const successPaths = {
    task_packet: 'valid/success/task-packet.valid.json',
    decision_request: 'valid/success/review-finding.valid.json',
    authority_basis_decision: 'valid/success/human-decision.valid.json',
    consumption_receipt: 'valid/success/consumption-receipt.valid.json',
    continuation_context: 'valid/success/continuation-context.valid.json',
    agent_report: 'valid/success/agent-report.valid.json'
  };
  const stopPaths = {
    task_packet: 'valid/stop/task-packet.valid.json',
    decision_request: 'valid/stop/review-finding.valid.json',
    authority_basis_decision: 'valid/stop/authority-basis-decision.valid.json',
    stop_response: 'valid/stop/stop-response.valid.json'
  };
  const replacement = (caseId, pathValue, schema, role, expectedCodes, baseBundle = 'successful_continuation', context) => ({
    caseId,
    path: pathValue,
    schema,
    expectedCodes,
    baseBundle,
    replaceRecordPath: (baseBundle === 'pre_start_stop' ? stopPaths : successPaths)[role],
    ...(context ? { context } : {})
  });
  return [
    {
      caseId: 'agent-report-missing-context-record',
      baseBundle: 'successful_continuation',
      omittedRecordPaths: [successPaths.continuation_context],
      expectedCodes: ['MISSING_REQUIRED_RECORD']
    },
    {
      caseId: 'agent-report-missing-decision-record',
      baseBundle: 'successful_continuation',
      omittedRecordPaths: [successPaths.authority_basis_decision],
      expectedCodes: ['MISSING_REQUIRED_RECORD']
    },
    replacement('leap-second-expiry', 'invalid/consumption-receipt.leap-second-expiry.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['TIMESTAMP_UNCOMPARABLE']),
    replacement('fractional-claim-order', 'invalid/consumption-receipt.fractional-claim-order.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['CLAIM_START_CHRONOLOGY_INVALID']),
    replacement('report-before-start', 'invalid/agent-report.return-before-start.invalid.json', 'agent-report.schema.json', 'agent_report', ['REPORT_BEFORE_START']),
    replacement('human-decision-digest-mismatch', 'invalid/human-decision.digest-mismatch.invalid.json', 'human-decision.schema.json', 'authority_basis_decision', ['DIGEST_MISMATCH']),
    replacement('agent-report-stripped-context', 'invalid/agent-report.stripped-context.invalid.json', 'agent-report.schema.json', 'agent_report', ['SCHEMA_VALIDATION_FAILED', 'STRIPPED_OR_MISMATCHED_CONTEXT']),
    replacement('continuation-context-stale-replay', 'invalid/continuation-context.stale-replay.invalid.json', 'continuation-context.schema.json', 'continuation_context', ['STALE_REPLAY']),
    replacement('receipt-expired', 'invalid/consumption-receipt.expired.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['EXPIRED_AT_START', 'EXPIRED_RECEIPT']),
    replacement('receipt-revoked', 'invalid/consumption-receipt.revoked.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['REVOCATION_STATUS_REJECTED'], 'successful_continuation', { revokedDecisionDigests: [success.authority_basis_decision.digest.value] }),
    replacement('receipt-scope-expansion', 'invalid/consumption-receipt.scope-expansion.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['SCOPE_EXPANSION']),
    replacement('non-approval-consumption', 'invalid/human-decision.non-approval.invalid.json', 'human-decision.schema.json', 'authority_basis_decision', ['NON_APPROVAL_DECISION']),
    replacement('report-spliced-authority', 'invalid/agent-report.spliced-authority.invalid.json', 'agent-report.schema.json', 'agent_report', ['REPORT_PACKET_MISMATCH']),
    replacement('report-spliced-decision', 'invalid/agent-report.spliced-decision.invalid.json', 'agent-report.schema.json', 'agent_report', ['REPORT_DECISION_MISMATCH']),
    replacement('report-spliced-request', 'invalid/agent-report.spliced-request.invalid.json', 'agent-report.schema.json', 'agent_report', ['DECISION_REQUEST_CHAIN_MISMATCH', 'REPORT_DECISION_REQUEST_MISMATCH']),
    replacement('task-loop-ceiling', 'invalid/task-packet.loop-ceiling.invalid.json', 'task-packet.schema.json', 'task_packet', ['LOOP_CEILING_EXCEEDED']),
    replacement('report-loop-counter', 'invalid/agent-report.loop-counter.invalid.json', 'agent-report.schema.json', 'agent_report', ['LOOP_COUNTER_MISMATCH']),
    replacement('report-spliced-start-evidence', 'invalid/agent-report.spliced-start-evidence.invalid.json', 'agent-report.schema.json', 'agent_report', ['START_EVIDENCE_BINDING_MISMATCH']),
    replacement('receipt-expired-before-start', 'invalid/consumption-receipt.expired-before-start.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['EXPIRED_AT_START']),
    replacement('receipt-claim-after-start', 'invalid/consumption-receipt.claim-after-start.invalid.json', 'consumption-receipt.schema.json', 'consumption_receipt', ['CLAIM_START_CHRONOLOGY_INVALID']),
    {
      caseId: 'receipt-divergent-request',
      records: [
        ...Object.entries(successPaths).map(([role, fixturePath]) => ({
          role,
          path: role === 'consumption_receipt'
            ? 'invalid/consumption-receipt.divergent-request.invalid.json'
            : fixturePath
        })),
        { role: 'stop_response', path: stopPaths.stop_response }
      ],
      expectedCodes: [
        'DECISION_REQUEST_CHAIN_MISMATCH',
        'DECISION_REQUEST_MISMATCH',
        'STOP_AUTHORITY_BASIS_DECISION_MISMATCH',
        'STOP_PACKET_MISMATCH',
        'UNDECLARED_VALIDATION_INPUT'
      ]
    },
    replacement('stop-spliced-packet', 'invalid/stop-response.spliced-packet.invalid.json', 'stop-response.schema.json', 'stop_response', ['STOP_PACKET_MISMATCH'], 'pre_start_stop')
  ];
}

function equalDigest(left, right) {
  return left?.algorithm === right?.algorithm
    && left?.canonicalization === right?.canonicalization
    && left?.digestDomain === right?.digestDomain
    && left?.value === right?.value;
}

function sameDecisionRequest(left, right) {
  return left?.kind === right?.kind
    && left?.id === right?.id
    && equalDigest(left?.digest, right?.digest);
}

function parseTimestamp(value) {
  const fraction = typeof value === 'string' ? value.match(/\.(\d+)/) : null;
  const whole = typeof value === 'string'
    ? Date.parse(fraction ? value.replace(fraction[0], '') : value)
    : NaN;
  return Number.isFinite(whole) ? { whole, fraction: fraction?.[1] || '' } : null;
}

function compareTimestamps(left, right) {
  if (left.whole !== right.whole) return Math.sign(left.whole - right.whole);
  const width = Math.max(left.fraction.length, right.fraction.length);
  const a = left.fraction.padEnd(width, '0');
  const b = right.fraction.padEnd(width, '0');
  return a < b ? -1 : a > b ? 1 : 0;
}

function validateSemantics(entries, context = {}, bundleKind = 'explicit') {
  const diagnostics = [];
  const add = (code, message) => diagnostics.push({ code, message });
  const byRole = Object.fromEntries(entries.map((item) => [item.role, item.record]));
  const task = byRole.task_packet;
  const finding = byRole.decision_request;
  const decision = byRole.authority_basis_decision;
  const receipt = byRole.consumption_receipt;
  const continuation = byRole.continuation_context;
  const report = byRole.agent_report;
  const stop = byRole.stop_response;
  const responseDecision = byRole.response_decision;

  const requireRole = (record, roles, label) => {
    if (!record) return;
    for (const role of roles) {
      if (!byRole[role]) add('MISSING_REQUIRED_RECORD', `${label} requires ${role} for bundle validation.`);
    }
  };
  requireRole(finding, ['task_packet'], 'review finding');
  requireRole(decision, ['task_packet', 'decision_request'], 'authority-basis decision');
  requireRole(receipt, ['task_packet', 'authority_basis_decision'], 'consumption receipt');
  requireRole(continuation, ['task_packet', 'authority_basis_decision', 'consumption_receipt'], 'continuation context');
  requireRole(report, ['task_packet', 'authority_basis_decision', 'consumption_receipt', 'continuation_context'], 'agent report');
  requireRole(stop, ['task_packet', 'authority_basis_decision'], 'stop response');
  requireRole(responseDecision, ['task_packet', 'stop_response'], 'response decision');

  const timestamps = {
    decisionCreated: decision?.createdAt,
    claimed: receipt?.claim?.claimedAt,
    expires: receipt?.singleConsumerBasis?.receiptExpiresAt,
    readBack: report?.startEvidence?.acceptedClaimReadBackAt,
    started: report?.startEvidence?.workStartedAt,
    returned: report?.returnedAt
  };
  const times = {};
  for (const [name, value] of Object.entries(timestamps)) {
    if (value === undefined) continue;
    times[name] = parseTimestamp(value);
    if (!times[name]) add('TIMESTAMP_UNCOMPARABLE', `${name} cannot establish deterministic timestamp ordering.`);
  }
  const after = (left, right) => times[left] && times[right]
    && compareTimestamps(times[left], times[right]) > 0;
  const atOrBefore = (left, right) => times[left] && times[right]
    && compareTimestamps(times[left], times[right]) <= 0;

  for (const { record } of entries) {
    const kind = kindFromRecord[record?.recordKind];
    if (kind && record.digest && !equalDigest(record.digest, digestRecord(kind, record))) {
      add('DIGEST_MISMATCH', `${kind} digest does not match its domain-wrapped RFC 8785 JCS preimage.`);
    }
  }
  if (finding && task && (finding.packetId !== task.packetId || !equalDigest(finding.packetDigest, task.digest))) {
    add('PACKET_REFERENCE_MISMATCH', 'Review finding does not bind the current task packet.');
  }
  if (decision && task && (decision.packetId !== task.packetId || !equalDigest(decision.packetDigest, task.digest))) {
    add('PACKET_REFERENCE_MISMATCH', 'Authority-basis decision does not bind the current task packet.');
  }
  if (decision && finding && (decision.decisionRequest.kind !== 'review_finding'
    || decision.decisionRequest.id !== finding.findingId
    || !equalDigest(decision.decisionRequest.digest, finding.digest))) {
    add('DECISION_REQUEST_MISMATCH', 'Authority-basis decision does not bind the current review finding.');
  }
  if (responseDecision && stop && (responseDecision.decisionRequest.kind !== 'stop_response'
    || responseDecision.decisionRequest.id !== stop.stopId
    || !equalDigest(responseDecision.decisionRequest.digest, stop.digest))) {
    add('DECISION_REQUEST_MISMATCH', 'Response decision does not bind the exact stop response.');
  }
  if (responseDecision && decision && responseDecision.decisionId === decision.decisionId) {
    add('RESPONSE_DECISION_ID_REUSE', 'Response decision must have an identity distinct from the authority-basis decision.');
  }
  if (responseDecision?.decision === 'approve_bounded_successor') {
    add('NON_APPROVAL_DECISION', 'The stop-response fixture permits only a non-approval response.');
  }
  if (receipt && decision && (receipt.decisionId !== decision.decisionId || !equalDigest(receipt.decisionDigest, decision.digest))) {
    add('STALE_REPLAY', 'Consumption receipt does not bind the current human decision revision.');
  }
  if (receipt && finding && (receipt.decisionRequest.kind !== 'review_finding'
    || receipt.decisionRequest.id !== finding.findingId
    || !equalDigest(receipt.decisionRequest.digest, finding.digest))) {
    add('DECISION_REQUEST_MISMATCH', 'Consumption receipt does not bind the current review finding.');
  }
  if (receipt && decision && !sameDecisionRequest(receipt.decisionRequest, decision.decisionRequest)) {
    add('DECISION_REQUEST_CHAIN_MISMATCH', 'Consumption receipt does not preserve the human decision request exactly.');
  }
  if (receipt && decision) {
    if (decision.decision !== 'approve_bounded_successor') {
      add('NON_APPROVAL_DECISION', 'A non-approval decision cannot authorize a consumption receipt.');
    }
    const approved = new Set(decision.approvedSuccessorScope);
    if (receipt.claim.permittedScope.some((item) => !approved.has(item))) {
      add('SCOPE_EXPANSION', 'Consumption receipt claim exceeds the approved successor scope.');
    }
    if (atOrBefore('expires', 'claimed')) add('EXPIRED_RECEIPT', 'Receipt expiry is not later than its claim time.');
    if (after('decisionCreated', 'claimed')) add('CLAIM_START_CHRONOLOGY_INVALID', 'Consumption claim predates the human decision.');
    if ((context.revokedDecisionDigests || []).includes(decision.digest.value)) {
      add('REVOCATION_STATUS_REJECTED', 'Trusted fixture context marks the exact decision revision revoked.');
    }
  }
  if (continuation && decision && (!equalDigest(continuation.decision.digest, decision.digest)
    || continuation.decision.id !== decision.decisionId)) {
    add('STALE_REPLAY', 'Continuation context references a stale or unknown human decision revision.');
  }
  if (continuation && receipt && (!equalDigest(continuation.consumptionReceipt.digest, receipt.digest)
    || continuation.consumptionReceipt.id !== receipt.receiptId
    || continuation.successorInvocationId !== receipt.claim.successorInvocationId)) {
    add('CONSUMPTION_REFERENCE_MISMATCH', 'Continuation context does not bind the accepted receipt and successor.');
  }
  if (report && continuation && (!equalDigest(report.continuationContext?.digest, continuation.digest)
    || report.continuationContext?.id !== continuation.contextId)) {
    add('STRIPPED_OR_MISMATCHED_CONTEXT', 'Agent report does not carry the required continuation context binding.');
  }
  if (report && task && report.packetId !== task.packetId) add('REPORT_PACKET_MISMATCH', 'Agent report does not bind the current task packet.');
  if (report && decision && (report.decision.id !== decision.decisionId
    || !equalDigest(report.decision.digest, decision.digest))) {
    add('REPORT_DECISION_MISMATCH', 'Agent report does not bind the current human decision revision.');
  }
  if (report && finding && (report.decisionRequest.kind !== 'review_finding'
    || report.decisionRequest.id !== finding.findingId
    || !equalDigest(report.decisionRequest.digest, finding.digest))) {
    add('REPORT_DECISION_REQUEST_MISMATCH', 'Agent report does not bind the current review finding.');
  }
  if (report && decision && !sameDecisionRequest(report.decisionRequest, decision.decisionRequest)) {
    add('DECISION_REQUEST_CHAIN_MISMATCH', 'Agent report does not preserve the human decision request exactly.');
  }
  if (report && receipt && (report.consumptionReceiptId !== receipt.receiptId
    || !equalDigest(report.consumptionReceiptDigest, receipt.digest)
    || report.successorInvocationId !== receipt.claim.successorInvocationId)) {
    add('CONSUMPTION_REFERENCE_MISMATCH', 'Agent report does not bind the accepted receipt and successor.');
  }
  if (task && task.loopPolicy.counter > task.loopPolicy.ceiling) add('LOOP_CEILING_EXCEEDED', 'Task loop counter exceeds its declared ceiling.');
  if (report && task && report.loopCounter !== task.loopPolicy.counter) add('LOOP_COUNTER_MISMATCH', 'Agent report does not preserve the task loop counter.');
  if (report?.startEvidence) {
    const startEvidenceInput = structuredClone(report.startEvidence);
    delete startEvidenceInput.digest;
    const expected = digestEnvelope(domains['successor-start-evidence'], startEvidenceInput);
    if (!equalDigest(report.startEvidence.digest, expected)) add('START_EVIDENCE_DIGEST_MISMATCH', 'Start evidence digest is invalid.');
    if (receipt && (report.startEvidence.successorInvocationId !== report.successorInvocationId
      || report.startEvidence.successorInvocationId !== receipt.claim.successorInvocationId
      || report.startEvidence.consumptionReceiptId !== report.consumptionReceiptId
      || report.startEvidence.consumptionReceiptId !== receipt.receiptId
      || !equalDigest(report.startEvidence.consumptionReceiptDigest, report.consumptionReceiptDigest)
      || !equalDigest(report.startEvidence.consumptionReceiptDigest, receipt.digest))) {
      add('START_EVIDENCE_BINDING_MISMATCH', 'Start evidence does not bind the accepted receipt and reported successor.');
    }
    if (after('readBack', 'started')) add('CLAIM_AFTER_START', 'Accepted claim readback occurs after work start.');
    if (receipt) {
      if (after('claimed', 'readBack') || after('readBack', 'started')) {
        add('CLAIM_START_CHRONOLOGY_INVALID', 'Decision, claim, accepted-claim readback, and work start are not in canonical order.');
      }
      if (atOrBefore('expires', 'readBack') || atOrBefore('expires', 'started')) {
        add('EXPIRED_AT_START', 'Receipt was not valid through accepted-claim readback and successor start.');
      }
    }
  }
  if (after('started', 'returned')) add('REPORT_BEFORE_START', 'Agent report return time precedes successor work start.');
  if (stop && task && stop.packetId !== task.packetId) add('STOP_PACKET_MISMATCH', 'Stop response does not bind the current task packet.');
  if (stop && decision && stop.decisionId !== decision.decisionId) {
    add('STOP_AUTHORITY_BASIS_DECISION_MISMATCH', 'Stop response does not identify the bundle authority-basis decision.');
  }
  if (stop && report?.startEvidence
    && stop.successorInvocationId === report.startEvidence.successorInvocationId) {
    add('STOP_AFTER_WORK', 'The stop no-start assertion conflicts with the report digest-bound start assertion for the same invocation.');
  }
  return diagnostics;
}

async function loadValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schemas = {};
  for (const kind of [...recordKinds, 'common-defs']) {
    const file = `${kind}.schema.json`;
    schemas[file] = await readJson(path.join(schemaRoot, file));
  }
  ajv.addSchema(schemas['common-defs.schema.json']);
  for (const kind of recordKinds) ajv.addSchema(schemas[`${kind}.schema.json`]);
  return Object.fromEntries(recordKinds.map((kind) => [kind, ajv.getSchema(schemas[`${kind}.schema.json`].$id)]));
}

async function loadManifestValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schema = await readJson(manifestSchemaPath);
  return ajv.compile(schema);
}

function schemaDiagnostics(validators, record) {
  const kind = kindFromRecord[record?.recordKind];
  if (!kind) return [{ code: 'SCHEMA_VALIDATION_FAILED', message: `Unknown record kind ${record?.recordKind ?? '<missing>'}.` }];
  const validate = validators[kind];
  if (validate(record)) return [];
  return (validate.errors || []).map((error) => ({
    code: 'SCHEMA_VALIDATION_FAILED',
    message: `${error.instancePath || '/'} ${error.message}`,
    keyword: error.keyword
  }));
}

function safeFixturePath(relativePath) {
  if (typeof relativePath !== 'string'
    || path.isAbsolute(relativePath)
    || relativePath.includes('\\')
    || path.posix.normalize(relativePath) !== relativePath
    || relativePath.split('/').includes('..')
    || !/^(valid|invalid)\/.+\.json$/.test(relativePath)) {
    throw new Error(`MANIFEST_PATH_INVALID: ${String(relativePath)}`);
  }
  const absolute = path.resolve(fixtureRoot, relativePath);
  if (!absolute.startsWith(`${fixtureRoot}${path.sep}`)) throw new Error(`MANIFEST_PATH_ESCAPE: ${relativePath}`);
  return absolute;
}

function exactRoleSet(kind, records) {
  const expected = [...bundleRoles[kind]].sort();
  const actual = records.map((item) => item.role).sort();
  return expected.length === actual.length && expected.every((role, index) => role === actual[index]);
}

async function listJsonFiles(root, prefix) {
  const result = [];
  async function walk(directory, relative) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), childRelative);
      else if (entry.isFile() && entry.name.endsWith('.json')) result.push(`${prefix}/${childRelative}`);
    }
  }
  await walk(root, '');
  return result.sort();
}

async function validateManifest(manifest) {
  const validate = await loadManifestValidator();
  if (!validate(manifest)) throw new Error(`MANIFEST_SCHEMA_INVALID: ${JSON.stringify(validate.errors)}`);
  const bundleIds = manifest.expectedValidBundles.map((bundle) => bundle.id);
  if (new Set(bundleIds).size !== bundleIds.length) throw new Error('MANIFEST_DUPLICATE_BUNDLE');
  const expectedKinds = Object.keys(bundleRoles).sort();
  if (bundleIds.slice().sort().join('|') !== expectedKinds.join('|')) throw new Error('MANIFEST_BUNDLE_SET_INVALID');
  const inventoryPaths = manifest.fixtureInventory.map((item) => item.path);
  if (new Set(inventoryPaths).size !== inventoryPaths.length) throw new Error('MANIFEST_DUPLICATE_INVENTORY_PATH');
  const inventory = new Map(manifest.fixtureInventory.map((item) => [item.path, item]));
  const usedPaths = new Set();
  const bundleMap = new Map();
  for (const bundle of manifest.expectedValidBundles) {
    if (bundle.id !== bundle.kind || !exactRoleSet(bundle.kind, bundle.records)) throw new Error(`MANIFEST_BUNDLE_ROLES_INVALID: ${bundle.id}`);
    const roles = bundle.records.map((item) => item.role);
    const paths = bundle.records.map((item) => item.path);
    if (new Set(roles).size !== roles.length || new Set(paths).size !== paths.length) throw new Error(`MANIFEST_BUNDLE_DUPLICATE: ${bundle.id}`);
    const kinds = roles.map((role) => roleKinds[role]);
    const duplicateKinds = kinds.filter((kind, index) => kinds.indexOf(kind) !== index);
    if (duplicateKinds.some((kind) => !(bundle.kind === 'stop_decision_response' && kind === 'human-decision'))) {
      throw new Error(`MANIFEST_DUPLICATE_RECORD_KIND: ${bundle.id}`);
    }
    for (const item of bundle.records) {
      safeFixturePath(item.path);
      const inventoryItem = inventory.get(item.path);
      if (!inventoryItem || inventoryItem.schema !== `${roleKinds[item.role]}.schema.json`) {
        throw new Error(`MANIFEST_BUNDLE_PATH_INVALID: ${bundle.id}:${item.path}`);
      }
      usedPaths.add(item.path);
    }
    bundleMap.set(bundle.id, bundle);
  }
  if (usedPaths.size !== inventory.size || [...inventory.keys()].some((item) => !usedPaths.has(item))) {
    throw new Error('MANIFEST_UNCOVERED_VALID_FIXTURE');
  }
  const stopBundle = bundleMap.get('pre_start_stop');
  const responseBundle = bundleMap.get('stop_decision_response');
  for (const role of ['task_packet', 'decision_request', 'authority_basis_decision', 'stop_response']) {
    const left = stopBundle.records.find((item) => item.role === role)?.path;
    const right = responseBundle.records.find((item) => item.role === role)?.path;
    if (!left || left !== right) throw new Error(`MANIFEST_SHARED_ANTECEDENT_INVALID: ${role}`);
  }
  const coveredKinds = new Set(manifest.fixtureInventory.map((item) => item.schema.replace('.schema.json', '')));
  if (recordKinds.some((kind) => !coveredKinds.has(kind))) throw new Error('MANIFEST_RECORD_KIND_COVERAGE_INVALID');
  const caseIds = manifest.expectedInvalid.map((item) => item.caseId);
  if (new Set(caseIds).size !== caseIds.length) throw new Error('MANIFEST_DUPLICATE_CASE_ID');
  const invalidPaths = new Set();
  for (const entry of manifest.expectedInvalid) {
    if ('path' in entry) {
      safeFixturePath(entry.path);
      invalidPaths.add(entry.path);
      const base = bundleMap.get(entry.baseBundle);
      const target = base.records.find((item) => item.path === entry.replaceRecordPath);
      if (!target) throw new Error(`MANIFEST_REPLACEMENT_TARGET_INVALID: ${entry.caseId}`);
      if (entry.schema !== `${roleKinds[target.role]}.schema.json`) throw new Error(`MANIFEST_REPLACEMENT_KIND_INVALID: ${entry.caseId}`);
      for (const omitted of entry.omittedRecordPaths || []) {
        if (!base.records.some((item) => item.path === omitted) || omitted === entry.replaceRecordPath) {
          throw new Error(`MANIFEST_OMISSION_INVALID: ${entry.caseId}`);
        }
      }
    } else if ('omittedRecordPaths' in entry) {
      const base = bundleMap.get(entry.baseBundle);
      for (const omitted of entry.omittedRecordPaths) {
        safeFixturePath(omitted);
        if (!base.records.some((item) => item.path === omitted)) throw new Error(`MANIFEST_OMISSION_INVALID: ${entry.caseId}`);
      }
    } else {
      const roles = entry.records.map((item) => item.role);
      const paths = entry.records.map((item) => item.path);
      if (new Set(roles).size !== roles.length || new Set(paths).size !== paths.length) {
        throw new Error(`MANIFEST_EXPLICIT_DUPLICATE: ${entry.caseId}`);
      }
      for (const item of entry.records) {
        safeFixturePath(item.path);
        if (item.path.startsWith('invalid/')) invalidPaths.add(item.path);
      }
    }
  }
  const actualValid = await listJsonFiles(validRoot, 'valid');
  const actualInvalid = await listJsonFiles(invalidRoot, 'invalid');
  if (actualValid.join('|') !== [...inventory.keys()].sort().join('|')) throw new Error('MANIFEST_VALID_FILE_INVENTORY_MISMATCH');
  if (actualInvalid.join('|') !== [...invalidPaths].sort().join('|')) throw new Error('MANIFEST_INVALID_FILE_INVENTORY_MISMATCH');
  return { bundleMap, inventory };
}

async function loadEntries(descriptors) {
  const entries = [];
  for (const descriptor of descriptors) {
    const record = await readJson(safeFixturePath(descriptor.path));
    if (kindFromRecord[record.recordKind] !== roleKinds[descriptor.role]) {
      throw new Error(`MANIFEST_ROLE_KIND_MISMATCH: ${descriptor.role}:${descriptor.path}`);
    }
    entries.push({ ...descriptor, record });
  }
  return entries;
}

function rebindDownstream(entries, targetRole) {
  const byRole = Object.fromEntries(entries.map((item) => [item.role, item.record]));
  const recompute = (role) => {
    const record = byRole[role];
    if (!record || role === targetRole) return;
    record.digest = digestRecord(roleKinds[role], record);
  };
  if (byRole.decision_request && byRole.task_packet && targetRole !== 'decision_request') {
    byRole.decision_request.packetId = byRole.task_packet.packetId;
    byRole.decision_request.packetDigest = byRole.task_packet.digest;
    recompute('decision_request');
  }
  if (byRole.authority_basis_decision && byRole.task_packet && byRole.decision_request
    && targetRole !== 'authority_basis_decision') {
    byRole.authority_basis_decision.packetId = byRole.task_packet.packetId;
    byRole.authority_basis_decision.packetDigest = byRole.task_packet.digest;
    byRole.authority_basis_decision.decisionRequest = {
      kind: 'review_finding',
      id: byRole.decision_request.findingId,
      digest: byRole.decision_request.digest
    };
    recompute('authority_basis_decision');
  }
  if (byRole.consumption_receipt && byRole.authority_basis_decision && byRole.decision_request
    && targetRole !== 'consumption_receipt') {
    byRole.consumption_receipt.decisionId = byRole.authority_basis_decision.decisionId;
    byRole.consumption_receipt.decisionDigest = byRole.authority_basis_decision.digest;
    byRole.consumption_receipt.decisionRequest = structuredClone(byRole.authority_basis_decision.decisionRequest);
    recompute('consumption_receipt');
  }
  if (byRole.continuation_context && byRole.authority_basis_decision && byRole.consumption_receipt
    && targetRole !== 'continuation_context') {
    byRole.continuation_context.decision = {
      id: byRole.authority_basis_decision.decisionId,
      digest: byRole.authority_basis_decision.digest
    };
    byRole.continuation_context.consumptionReceipt = {
      id: byRole.consumption_receipt.receiptId,
      digest: byRole.consumption_receipt.digest
    };
    byRole.continuation_context.successorInvocationId = byRole.consumption_receipt.claim.successorInvocationId;
    recompute('continuation_context');
  }
  if (byRole.agent_report && byRole.authority_basis_decision
    && byRole.consumption_receipt && byRole.continuation_context
    && targetRole !== 'agent_report') {
    if (byRole.task_packet) {
      byRole.agent_report.packetId = byRole.task_packet.packetId;
      byRole.agent_report.loopCounter = byRole.task_packet.loopPolicy.counter;
    }
    byRole.agent_report.decision = {
      id: byRole.authority_basis_decision.decisionId,
      digest: byRole.authority_basis_decision.digest
    };
    if (byRole.decision_request) {
      byRole.agent_report.decisionRequest = {
        kind: 'review_finding',
        id: byRole.decision_request.findingId,
        digest: byRole.decision_request.digest
      };
    }
    byRole.agent_report.consumptionReceiptId = byRole.consumption_receipt.receiptId;
    byRole.agent_report.consumptionReceiptDigest = byRole.consumption_receipt.digest;
    byRole.agent_report.continuationContext = {
      id: byRole.continuation_context.contextId,
      digest: byRole.continuation_context.digest
    };
    byRole.agent_report.startEvidence.consumptionReceiptId = byRole.consumption_receipt.receiptId;
    byRole.agent_report.startEvidence.consumptionReceiptDigest = byRole.consumption_receipt.digest;
    const startInput = structuredClone(byRole.agent_report.startEvidence);
    delete startInput.digest;
    byRole.agent_report.startEvidence.digest = digestEnvelope(domains['successor-start-evidence'], startInput);
    recompute('agent_report');
  }
  if (byRole.response_decision && byRole.stop_response && byRole.task_packet
    && targetRole !== 'response_decision') {
    byRole.response_decision.packetId = byRole.task_packet.packetId;
    byRole.response_decision.packetDigest = byRole.task_packet.digest;
    byRole.response_decision.decisionRequest = {
      kind: 'stop_response',
      id: byRole.stop_response.stopId,
      digest: byRole.stop_response.digest
    };
    recompute('response_decision');
  }
  return entries;
}

function diagnosticCodes(diagnostics) {
  return [...new Set(diagnostics.map((item) => item.code))].sort();
}

async function validateInput(entries, validators, context = {}, bundleKind = 'explicit', declared = true) {
  const diagnostics = [];
  if (!declared) diagnostics.push({ code: 'UNDECLARED_VALIDATION_INPUT', message: 'Semantic input is not a declared valid bundle.' });
  const roles = entries.map((item) => item.role);
  if (new Set(roles).size !== roles.length) diagnostics.push({ code: 'DUPLICATE_RECORD_ROLE', message: 'Semantic input contains duplicate roles.' });
  const kinds = entries.map((item) => kindFromRecord[item.record?.recordKind]).filter(Boolean);
  const duplicateKinds = kinds.filter((kind, index) => kinds.indexOf(kind) !== index);
  const allowedTwoDecisions = bundleKind === 'stop_decision_response'
    && duplicateKinds.every((kind) => kind === 'human-decision');
  if (duplicateKinds.length && !allowedTwoDecisions) diagnostics.push({ code: 'DUPLICATE_RECORD_KIND', message: 'Semantic input contains duplicate record kinds.' });
  for (const item of entries) diagnostics.push(...schemaDiagnostics(validators, item.record));
  diagnostics.push(...validateSemantics(entries, context, bundleKind));
  return diagnostics;
}

async function constructInvalidInput(entry, bundleMap) {
  if ('path' in entry) {
    const base = bundleMap.get(entry.baseBundle);
    const descriptors = base.records.map((item) => ({ ...item }));
    const targetIndex = descriptors.findIndex((item) => item.path === entry.replaceRecordPath);
    descriptors[targetIndex].path = entry.path;
    const filtered = descriptors.filter((item) => !(entry.omittedRecordPaths || []).includes(item.path));
    const entries = await loadEntries(filtered);
    const targetRole = descriptors[targetIndex].role;
    return { entries: rebindDownstream(entries, targetRole), bundleKind: base.kind, declared: true };
  }
  if ('omittedRecordPaths' in entry) {
    const base = bundleMap.get(entry.baseBundle);
    const descriptors = base.records.filter((item) => !entry.omittedRecordPaths.includes(item.path));
    return { entries: await loadEntries(descriptors), bundleKind: base.kind, declared: true };
  }
  const entries = await loadEntries(entry.records);
  const target = entry.records.find((item) => item.path.startsWith('invalid/'));
  return {
    entries: rebindDownstream(entries, target?.role),
    bundleKind: 'explicit',
    declared: false
  };
}

async function expectedOutputs(packageData) {
  const outputs = new Map();
  for (const item of packageData.artifacts) {
    outputs.set(safeFixturePath(item.path), stableJson(item.record));
  }
  for (const [relativePath, record] of packageData.invalidRecords) {
    outputs.set(safeFixturePath(relativePath), stableJson(record));
  }
  const examples = {
    'task-packet': packageData.artifacts.find((item) => item.path === 'valid/success/task-packet.valid.json').record,
    'review-finding': packageData.artifacts.find((item) => item.path === 'valid/success/review-finding.valid.json').record,
    'human-decision': packageData.artifacts.find((item) => item.path === 'valid/success/human-decision.valid.json').record,
    'consumption-receipt': packageData.artifacts.find((item) => item.path === 'valid/success/consumption-receipt.valid.json').record,
    'continuation-context': packageData.artifacts.find((item) => item.path === 'valid/success/continuation-context.valid.json').record,
    'agent-report': packageData.artifacts.find((item) => item.path === 'valid/success/agent-report.valid.json').record,
    'stop-response': packageData.artifacts.find((item) => item.path === 'valid/stop/stop-response.valid.json').record
  };
  for (const [kind, record] of Object.entries(examples)) {
    outputs.set(path.join(sourceRoot, `${kind}.candidate.json`), stableJson(record));
  }
  outputs.set(path.join(fixtureRoot, 'manifest.json'), stableJson(packageData.manifest));
  return outputs;
}

async function writeOutputs(outputs) {
  for (const file of obsoleteGeneratedPaths) await rm(file, { force: true });
  for (const [file, content] of outputs) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
}

async function checkOutputs(outputs) {
  const drift = [];
  for (const [file, content] of outputs) {
    let actual;
    try { actual = await readFile(file, 'utf8'); } catch { actual = null; }
    if (actual !== content) drift.push(path.relative(repoRoot, file));
  }
  for (const file of obsoleteGeneratedPaths) {
    try {
      await readFile(file);
      drift.push(path.relative(repoRoot, file));
    } catch {
      // Expected absence.
    }
  }
  if (drift.length > 0) throw new Error(`Generated candidate vectors are stale, extra, or missing: ${drift.join(', ')}`);
  for (const kind of recordKinds) {
    const source = await readFile(path.join(sourceRoot, `${kind}.candidate.json`), 'utf8');
    if (/"value": "([0-6])\1{63}"/.test(source)) throw new Error(`${kind} historical example still contains a placeholder digest.`);
  }
}

async function validateCorpus(manifest) {
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
  const { bundleMap } = await validateManifest(manifest);
  for (const bundle of manifest.expectedValidBundles) {
    const entries = await loadEntries(bundle.records);
    const codes = diagnosticCodes(await validateInput(entries, validators, {}, bundle.kind, true));
    if (codes.length) throw new Error(`Expected-valid bundle ${bundle.id} failed: ${JSON.stringify(codes)}`);
  }
  for (const entry of manifest.expectedInvalid) {
    const input = await constructInvalidInput(entry, bundleMap);
    const codes = diagnosticCodes(await validateInput(input.entries, validators, entry.context || {}, input.bundleKind, input.declared));
    const expected = [...entry.expectedCodes].sort();
    if (codes.join('|') !== expected.join('|')) {
      throw new Error(`${entry.caseId} diagnostics ${JSON.stringify(codes)} did not exactly match ${JSON.stringify(expected)}.`);
    }
  }
  return {
    schemas: recordKinds.length,
    expectedValidBundles: manifest.expectedValidBundles.length,
    fixtureInventory: manifest.fixtureInventory.length,
    expectedInvalid: manifest.expectedInvalid.length,
    digestAlgorithm: 'sha256',
    canonicalization: 'RFC 8785 JCS',
    candidateOnly: true,
    reviewRequired: ['digest domains'],
    ownerRuled: ['second-implementation qualification']
  };
}

async function main() {
  try {
    const packageData = await buildConformancePackage();
    const outputs = await expectedOutputs(packageData);
    if (writeMode) await writeOutputs(outputs);
    if (checkMode) await checkOutputs(outputs);
    const persistedManifest = await readJson(path.join(fixtureRoot, 'manifest.json'));
    const result = await validateCorpus(persistedManifest);
    process.stdout.write(`${JSON.stringify({ ok: true, ...result }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error.message }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

export {
  buildConformancePackage,
  diagnosticCodes,
  digestEnvelope,
  digestRecord,
  loadManifestValidator,
  loadValidators,
  safeFixturePath,
  schemaDiagnostics,
  validateCorpus,
  validateInput,
  validateManifest,
  validateSemantics
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
