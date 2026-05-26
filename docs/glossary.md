# HACP Glossary

This glossary is public-safe protocol framing for core HACP contracts and
authority boundaries.

## Core Contract Objects

- `TaskPacket`: bounded, human-approved task intent and constraints.
- `AgentReport`: execution/output record returned for review and import.
- `EvidenceSet`: references and artifacts used to justify report claims.
- `HumanDecision`: explicit approve/reject/defer authority checkpoint.
- `StopReason`: typed reason that continuation stopped or was rejected.
- `Receipt`: custody/readback marker for import/verification steps.
- `AuditEvent`: immutable event record for lifecycle and authority traceability.

## Lifecycle Terms

- `packet.received`: packet intake acknowledged.
- `packet.exported`: packet handed to external or local workflow path.
- `packet.validated`: packet contract checks passed.
- `report.built`: report artifact assembled.
- `report.ready_for_import`: report prepared for app-side verifier/import.
- `report.import_verifier_checked`: import verification checks passed.
- `human_decision_required`: authority gate is still open and required.
- `stopped`: execution path halted under explicit stop semantics.
- `rejected`: decision or result rejected with typed rationale.

## Boundary Terms

- `authority boundary`: rule defining who can approve risky transitions.
- `transport-neutral`: contract does not depend on one transport mechanism.
- `owner-controlled`: execution boundary stays under owner/operator control.
- `adapter`: implementation path carrying records without granting authority.
- `projection`: derived read model (for example OTEL), not source authority.
