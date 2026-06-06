# HACP Glossary

This glossary is public-safe protocol framing for core HACP contracts and
authority boundaries.

## Core Contract Objects

- `TaskPacket`: bounded, human-approved task intent, source context,
  authority boundaries, expected evidence, stop conditions, and approved
  profile references.
- `AgentReport`: output/evidence record returned by a worker, runner,
  reviewer, agent, or adapter for review and import. It records what was
  attempted, what evidence was produced, and which proof binds the report to
  the packet.
- `EvidenceSet`: source links, summaries, check outputs, review findings,
  digests, and report artifacts used to support a human decision.
- `HumanDecision`: explicit approve, hold, reject, revise, send-back, or stop
  authority checkpoint made by the accountable human.
- `StopResponse`: typed record indicating why continuation stopped or was
  rejected (with `stop_reason` as the typed reason field).
- `Receipt`: custody/readback marker for import/verification steps.
- `AuditEvent`: immutable event record for lifecycle and authority traceability.
- `AuditLog`: append-only readback of packets, reports, evidence, decisions,
  rejects, send-back notes, and stop reasons.

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
- `sent_back`: human correction path that preserves source context, notes,
  requested correction, and expected next state.

These lifecycle labels are projection-oriented terms for public framing. Base
audit `event_type` vocabulary remains defined in
[RFC-0007](../rfcs/0007-audit-trail-and-evidence-set.md), and base status
vocabulary remains defined in
[decision-matrix-base-v0.1.yaml](../decision-matrix-base-v0.1.yaml).

## Boundary Terms

- `authority boundary`: rule defining who can approve risky transitions.
- `transport-neutral`: contract does not depend on one transport mechanism.
- `owner-controlled`: execution boundary stays under owner/operator control.
- `adapter`: implementation path carrying records without granting authority.
- `projection`: derived read model (for example OpenTelemetry/OTel), not source
  authority.
- `source context`: original request visibility for the human decision, such as
  the human request, prompt, task packet, spec, acceptance criteria, repo,
  issue, PR, imported report source, or prior send-back notes.
- `approved tool profile`: reviewed tool boundary describing tool identity,
  command shape, allowed/forbidden parameters, risky flag approvals,
  runtime/toolchain expectations, network/write policy, owner, steward, expiry,
  evidence refs, and profile digest or equivalent binding proof.
- `fail-closed preflight`: stop behavior when packet, profile, command,
  parameter, risky flag, runtime, or report proof does not match. The mismatch
  returns diagnostics for a human decision instead of silently widening
  authority.
- `runner report import proof`: custody evidence that an imported report is
  bound to a packet/profile chain. It supports human review; it is not
  approval, task completion, merge readiness, or external mutation proof.
