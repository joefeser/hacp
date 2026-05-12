# HACP 0.2: Chain-of-Custody Protocol for Human-Authorized Agent Work

Status: experimental protocol draft.

HACP 0.2 describes a human-authorized chain of custody for bounded agent work.
It is not an agent runtime, a tool protocol, or an execution system. It defines
records that carry authority, return evidence, prove report custody, and record
human decisions.

## Why 0.2 Exists

HACP 0.1 covered bounded task packets, agent reports, decision gates, audit
evidence, and transport boundaries. HACP 0.2 adds the records needed to close a
non-executing local-adapter loop:

1. A human or owner system approves bounded work.
2. A handoff package carries that authority to a tool boundary.
3. An adapter returns a structured report.
4. A match proof links the report to exactly one authorized chain.
5. A human decision record captures the owner decision after review.

This draft is informed by implementation experiments, but it deliberately avoids
implementation-specific table names, routes, framework details, and private
workflow terms.

## Core Lifecycle

```text
Authority Packet
  -> Handoff Package
  -> Adapter Report
  -> Match Proof
  -> Human Decision Record
```

The lifecycle is append-only in intent. Later records reference earlier records
by identifiers and digests. Transporting a record does not widen authority.
Reporting a requested next step does not approve that next step. A human
decision record is required before consequential state changes are accepted.

## Core Vocabulary

### Authority Packet

The owner-approved work unit. It defines scope, authority, allowed surfaces,
forbidden surfaces, stop conditions, verification expectations, and the decision
boundary. It is the origin of bounded authority.

### Handoff Package

The transportable envelope that carries an authority packet to a tool or agent
boundary. It references the authority packet digest and declares transport,
expiry, target label, and boundary notices. It does not create new authority.

### Adapter Report

The structured return record from an adapter. It describes what happened,
changed surfaces, verification evidence, residual risks, boundary status, stop
condition status, and the adapter's requested next step. The requested next step
is advisory only.

### Match Proof

The durable record that links an adapter report to exactly one handoff package
and authority packet chain. A match proof is the protocol-level answer to:
"Which authorized work did this report come from?"

### Human Decision Record

The record of the human owner's decision after reviewing a matched report. It
captures the decision, reason, actor, digest references, and any required
confirmation. It does not execute work by itself.

### Digest Domain

The semantic domain in which a digest was computed. Structured adapter reports,
free-text reports, rendered packets, and handoff packages may all have different
canonicalization rules. Digests from different domains are not automatically
comparable.

### Transport Profile

How HACP records move between systems. Examples include manual copy/paste,
browser upload, local filesystem carry, or future automated transport. Transport
does not imply execution authority.

### Execution Profile

What, if anything, an adapter may do. HACP core supports no-execution/manual
workflows first. Any execution-capable profile must be explicitly declared and
human-approved.

### Human Decision Gate

The human-controlled boundary where advisory report requests become recorded
decisions. The gate may record decisions such as accepting follow-up, requesting
revision, marking complete, rejecting a report, or canceling the session.

### Authority Boundary

The declared limits of allowed work. Boundary breach, matrix drift, stale
handoff, blocked stop condition, and residual risk are review conditions that
must remain visible to the human decision gate.

### Stop Condition

A condition that should stop or block work when reached. Reports must state
whether stop conditions were met, blocked, unknown, or otherwise unresolved.

### Requested Next Step

The adapter's requested next action. It is useful evidence but never automatic
approval.

## Record Model

HACP 0.2 uses five primary record kinds:

| Record | Purpose | Schema |
| --- | --- | --- |
| `hacp.authority_packet` | Bounded approved work | `schemas/authority-packet.schema.json` |
| `hacp.handoff_package` | Transportable authority envelope | `schemas/handoff-package.schema.json` |
| `hacp.adapter_report` | Structured adapter return | `schemas/adapter-report.schema.json` |
| `hacp.match_proof` | Report-to-authority chain proof | `schemas/match-proof.schema.json` |
| `hacp.human_decision_record` | Human decision after review | `schemas/human-decision-record.schema.json` |

Each record includes `schemaVersion`. Digest fields use lowercase hex strings.
Records that compare digests must also identify the digest domain.

## Digest Domains

Digest domains are first-class in HACP 0.2.

Examples:

- `authority_packet_v0.2`: canonical authority packet payload.
- `handoff_package_v0.2`: canonical handoff package payload.
- `adapter_report_v0.2`: canonical structured adapter report.
- `match_proof_v0.2`: canonical match proof record.
- `human_decision_record_v0.2`: canonical human decision record.
- `legacy_free_text_report`: free-text report digest. Not comparable with
  structured adapter report digests unless a profile defines a shared digest
  basis.

A consumer must not treat two digests as equal proof unless both digest value
and digest domain match.

## Review Conditions

HACP 0.2 names these review conditions:

- `stale_handoff`: the report references an internally valid but non-latest
  handoff.
- `matrix_drift`: decision rules changed between handoff/report generation and
  review.
- `boundary_breach`: the adapter reports that boundaries were not preserved.
- `stop_blocked`: a stop condition is blocked or unresolved.
- `residual_risk`: the report carries residual risks.

Profiles may add review conditions, but unknown conditions must be treated as
requiring human review.

## Idempotency and Replay

HACP 0.2 expects explicit idempotency rules:

- A handoff package is idempotent within `(authorityPacketId,
  transportProfileId, targetLabel, handoffDigest)`.
- A structured adapter report is idempotent within `(handoffPackageId,
  reportDigest, digestDomain)`.
- A match proof is idempotent within `(handoffPackageId, reportId,
  reportDigest, digestDomain)`.
- A human decision record is idempotent within `(matchProofId, decisionRecordId)`
  or a profile-defined unique report-decision key.

Replay must not create duplicate authority, duplicate proof, or duplicate
decision state. Conflicting replay must be rejected or routed to human review.

## Audit Fail-Closed

If a state change depends on durable evidence, the evidence write and the state
change must succeed together or fail together. HACP 0.2 does not require a
specific database, but it does require implementations to document their
fail-closed strategy.

## Version Status

HACP 0.2 is not stable 1.0. It is a draft vocabulary and record model for
review, fixture building, and independent implementation feedback.
