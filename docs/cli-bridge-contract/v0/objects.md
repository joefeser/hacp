# CLI Bridge Object Inventory v0

Status: public candidate.

The objects below are stable enough for public HACP review as authority,
evidence, preflight, waiver, diagnostic, and import-readback contracts. Public
names may still evolve before a stable HACP version.

## Corporate Approved Tool Profile Packet

Required fields:

- `packetKind`, `packetVersion`, `profileId`, `profileVersion`
- `owner`, `steward`
- `approval.authority`, `approval.approvalRef`, `approval.approvedAt`,
  `approval.expiresAt`, `approval.reviewBy`
- `approvedPurpose`
- `tool.toolId`, `tool.executable`, `tool.version`, `tool.digest`
- `runtime.image`, `runtime.toolchain`
- `commands`
- `networkAccessPolicy`, `networkAccessObserved`
- `evidenceRefs`
- `boundary`
- `canonicalDigest`

Authority-bearing fields include owner, steward, approval, approved purpose,
commands, network access policy, evidence refs, risky flag approval rules, and
boundary statements. Evidence-only fields include computed digest readback,
observed network state, and boundary readback.

Forbidden assumptions: profile approval alone does not execute work, prove
completion, measure network blocking, mutate product state, or contact external
systems.

## Requested CLI Work Packet

Required fields:

- wrapper fields: `schema`, `schemaVersion`, `packetId`, `approved`,
  `authority`, `task`, `verification`, `stopConditions`
- profile request fields:
  `approvedToolProfileRequest.profileRef.profileId`,
  `approvedToolProfileRequest.profileRef.profileVersion`,
  `approvedToolProfileRequest.approvalRefs`,
  `approvedToolProfileRequest.evidenceRefs`,
  `approvedToolProfileRequest.tool`,
  `approvedToolProfileRequest.runtime`,
  `approvedToolProfileRequest.command`,
  `approvedToolProfileRequest.params`
- `expectedDigest` before profile trust

Optional fields include `subcommand`, risky flag approvals, and nullable
tool/runtime observations when a checker can fail closed.

Forbidden assumptions: a requested work packet is not permission to execute
without profile preflight and human authority evidence.

## Packet/Profile Preflight Result

Required fields:

- `allowed`
- `diagnostics`
- `diagnosticCodes`
- `readback.profileRef`
- `readback.approvalRefs`
- `readback.evidenceRefs`
- `readback.tool`
- `readback.runtime`
- `readback.command`
- `readback.params`
- `readback.riskyFlags`
- `boundary.noCommandExecuted`
- `boundary.noExternalSideEffects`
- `boundary.notWorkCompletion`

Forbidden assumptions: `allowed=true` is not work completion, report import
acceptance, product acceptance, or human approval.

## Runner Report With Approved Profile Proof

Required fields:

- `profile.profileId`, `profile.profileVersion`, `profile.profileDigest`
- `checkedRequest.command`, `checkedRequest.tool`,
  `checkedRequest.runtime`, `checkedRequest.approvalRefs`,
  `checkedRequest.evidenceRefs`,
  `checkedRequest.riskyFlagApprovalRefs`
- `packetDigest`
- `profileCheckResultDigest`
- `profileCheck.allowed`
- `profileCheck.diagnosticCodes`
- `profileCheck.boundaryAttestation`

Forbidden assumptions: a report proof is not trusted before packet, report, and
approved profile proof digests are verified.

## Evidence Import Verification Result

This is the public, transport-neutral name for the app-proven Product Import
Verification Result.

Required fields:

- `ok`
- `accepted`
- `diagnostics`
- `readback.accepted`
- `readback.evidenceOnly`
- `readback.failClosed`
- `readback.acceptedAsCompletion`
- `readback.commandsExecuted`
- `readback.productImportPerformed`
- `readback.packetDigest`
- `readback.reportDigest`
- `readback.computedReportDigest`
- `readback.approvedProfileProofVerified`
- `readback.stopReasons`
- `readback.previewDiagnosticCodes`

Forbidden assumptions: import verification does not record durable completion,
execute commands, approve merge, accept risk, or change product state.

## Runtime/Toolchain Mismatch Diagnostic

Required fields:

- `expectedRuntime.image`
- `observedRuntime.image`
- `expectedRuntime.toolchain`
- `observedRuntime.toolchain`
- `diagnostic.code`
- `failClosed`
- `evidenceRef`

Optional fields include a waiver reference when a human has accepted a scoped
mismatch. Runtime evidence is not trusted before packet digest and approved
profile proof pass.

## Risky Flag Approval Proof

Required fields:

- `param`
- `requestedValue`
- `requiredApprovalRef`
- `suppliedApprovalRefs`
- `approvalState`
- `diagnosticCode`

Forbidden assumptions: a risky flag is not approved by flag name alone. The
exact required approval ref must be present.

## Profile Mismatch Waiver

Required fields:

- `recordKind`
- `schemaVersion`
- `waiverId`
- `authorityRef`
- `coveredMismatchType`
- `coveredArtifacts`
- `allowedScope`
- `reason`
- `createdAt`
- `expiresAt`
- `status`
- `boundaryStatement`
- `canonicalDigest`

A waiver does not expand authority beyond exact artifact, scope, mismatch type,
status, and expiry coverage.

## Runner Output Evidence Bundle

Required fields:

- `recordKind`
- `schemaVersion`
- `bundleId`
- `commandRef`
- `reportRef`
- `stdout`
- `stderr`
- `artifacts`
- `captureLimitPolicy`
- `captureState`
- `redaction`
- `createdAt`
- `observedAt`
- `boundary`
- `canonicalDigest`

Captured output proves only captured output custody and integrity. It does not
prove work completion or authorize capture overflow.

## Doctor/Check Output

Required fields:

- `recordKind`
- `schemaVersion`
- `status`
- `checkedAt`
- `checkedArtifacts`
- `diagnostics`
- `minimalCorrection`
- `nextHumanAction`
- `boundary`
- `doctorDigest`

Optional fields include `stopReason`, profile mismatch waiver readback, and an
implementation-defined stitched trial bundle. Doctor readiness does not execute
or import work.

## Evidence Import Summary

This is the public, transport-neutral name for the app-proven Product Import
Summary.

Required fields:

- `recordKind`
- `schemaVersion`
- `title`
- `importStatus`
- `primaryReason`
- `nextHumanDecisionLabel`
- `status.evidenceAccepted`
- `status.evidenceOnly`
- `status.failClosed`
- `status.acceptedAsCompletion`
- `status.commandsExecuted`
- `status.importPerformed`
- `diagnosticsCount`
- `diagnostics`
- `technicalEvidence`
- `boundary`
- `summaryDigest`

The summary is a human-facing readback artifact. It is not an action execution
receipt or proof of completed work. `status.importPerformed` means an evidence
import/readback step happened; it does not mean product state was mutated.
