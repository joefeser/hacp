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

1. A human approves bounded work.
2. A handoff package carries that authority to a tool boundary.
3. An adapter returns a structured report.
4. A match proof links the report to exactly one authorized chain.
5. A human decision record captures the owner decision after review.

This draft is informed by implementation experiments, but it deliberately avoids
implementation-specific table names, routes, framework details, and private
workflow terms.

Owner-system approval is not part of the HACP 0.2 core authority path. A future
profile may define owner-system approval only when it is traceable to a prior
human-approved policy record. Consumers must reject untraceable non-human
authority origins.

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
Reporting a requested next step does not approve that next step. Implementations
must not apply a consequential state change without a human decision record that
authorizes that change.

In HACP 0.2, "chain of custody" means a linear chain of evidence references for
one handoff/report/decision path. Multiple handoffs or reports for the same
authority packet form multiple chains that share an authority origin.

## Core Vocabulary

### Authority Packet

The owner-approved work unit. It defines scope, authority, allowed surfaces,
forbidden surfaces, stop conditions, verification expectations, and the decision
boundary. It is the origin of bounded authority.

HACP 0.2 renames the v0.1 "task packet" concept to "authority packet" to make
the authority origin explicit. v0.1 task packets and v0.2 authority packets are
related concepts, but they are not the same JSON record shape.

`approval.approvalDigest` uses the `authority_packet_approval_v0.2` digest
domain and covers the canonical approval sub-record fields (`actorId`,
`actorKind`, and `approvedAt`), excluding the `approvalDigest` field itself.

### Handoff Package

The transportable envelope that carries an authority packet to a tool or agent
boundary. It references the authority packet digest and declares transport,
expiry, target label, and boundary notices. It does not create new authority.
Consumers must treat a handoff package past `expiresAt` as a `stale_handoff`
review condition and route it to human decision rather than silently accepting
it.

`boundaryNotice` is a required attestation, not a configurable permission set.
The base schema fixes its fields to `true` so producers cannot omit the
no-authority-transfer warning from a handoff.

### Adapter Report

The structured return record from an adapter. It describes what happened,
changed surfaces, verification evidence, residual risks, boundary status, stop
condition status, and the adapter's requested next step. The requested next step
is advisory only. This includes `cancel_session`: an adapter may request
cancellation, but nothing is canceled unless a human decision record confirms
that decision.

When `boundariesPreserved` is `false`, the adapter report must name at least one
boundary-crossed reason and must set `requestedNextStep` to
`request_human_decision`. This makes the schema-level boundary rule visible in
the prose as well as in JSON Schema conditionals.

### Adapter

An adapter is any human-invoked or system-invoked participant that consumes a
handoff package and returns an adapter report. Examples include a CLI wrapper, a
manual tool, a hosted agent bridge, or a no-execution validator. HACP 0.2 does
not define adapter authentication or runtime behavior. Profiles must declare
those details. HACP 0.2 uses "adapter report" where HACP 0.1 used "agent
report" to emphasize the boundary role: the record may come from a model-backed
agent, a CLI, a human-operated tool, or a future service.

### Match Proof

The durable record that links an adapter report to exactly one handoff package
and authority packet chain. A match proof is the protocol-level answer to:
"Which authorized work did this report come from?"

The adapter should not create its own match proof for its own report. A match
proof is created by the receiving owner system, verifier, or review service
after it checks the adapter report against the handoff package and authority
packet chain. A profile may define a trusted verifier role, but that role must
be distinct from merely returning the adapter report.

### Human Decision Record

The record of the human owner's decision after reviewing a matched report. It
captures the decision, reason, actor, digest references, and any required
confirmation. It does not execute work by itself.

### Digest Domain

The semantic domain in which a digest was computed. Structured adapter reports,
free-text reports, rendered packets, and handoff packages may all have different
canonicalization rules. Digests from different domains are not automatically
comparable. Unknown digest domains must be rejected or routed to human review
unless an accepted profile declares how to interpret them.

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
revision, marking complete, deferring with `request_human_decision`, rejecting a
report, or canceling the session. In a human decision record,
`request_human_decision` means "keep this matched report under human review";
it is not an adapter request.

### Authority Boundary

The declared limits of allowed work. Boundary breach, matrix drift, stale
handoff, blocked stop condition, and residual risk are review conditions that
must remain visible to the human decision gate.

### Stop Condition

A condition that should stop or block work when reached. Reports must state
whether stop conditions were met, blocked, unknown, or otherwise unresolved.
Authority packets must include at least one stop condition. For simple work, a
baseline condition such as "stop if scope or authority boundary is exceeded" is
still expected.

### Requested Next Step

The adapter's requested next action. It is useful evidence but never automatic
approval.

### Surface

A surface is a named area the authority packet permits or forbids. It may be a
file path, repository path, API area, service boundary, database namespace, or
other profile-defined target. Profiles must define the surface grammar they use.

### Consequential State Change

A consequential state change is any product, workflow, or authority state change
that accepts work, marks work complete, cancels work, requests revision, grants
additional authority, or changes the human review posture. Profiles may define
additional consequential states, but they must not narrow this base set.

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

## Canonicalization and Digest Domains

HACP 0.2 base records use RFC 8785 JSON Canonicalization Scheme (JCS) as the
normative canonicalization algorithm, identified as `json-rfc8785-jcs`.
Implementations claiming HACP 0.2 base support must be able to compute SHA-256
digests over UTF-8 encoded JCS output for the five core record kinds.

For a core record's own `digest`, the digest input is the canonical record
object with the top-level `digest` field omitted. For embedded reference
digests, the digest input is the referenced record in its own digest domain.
`approval.approvalDigest` is the special approval sub-record digest described in
the Authority Packet section.

Draft fixtures use placeholder digest values even when they name
`json-rfc8785-jcs`. They demonstrate structure and digest domains; they are not
conformance vectors.

Canonicalization describes how bytes are produced for hashing. Digest domain
describes what semantic record those bytes represent. Two digests are
comparable only when both canonicalization and digest domain are compatible.

## Digest Domains

Digest domains are first-class in HACP 0.2.

Examples:

- `authority_packet_approval_v0.2`: canonical approval sub-record in an
  authority packet.
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

The machine-readable draft registry for base 0.2 profile values is
`profiles/hacp-base-draft-v0.2.yaml`. The base JSON Schemas constrain core
digest objects to these domains and to 64-character SHA-256 values.
Sixteen-character digest prefixes appear only in human decision records for
display and audit correlation.

## Manual Override

`manual_override` is a permitted match method only when the proof also records
who overrode the normal match path and why. Implementations must preserve the
override actor and reason in the match proof or an equivalent linked audit
record. Draft fixtures include a minimal manual-override proof shape for this
escape hatch.

## Review Conditions

HACP 0.2 names these review conditions:

- `stale_handoff`: the report references an internally valid but non-latest
  handoff, or the handoff is past `expiresAt`.
- `matrix_drift`: decision rules changed between handoff/report generation and
  review.
- `boundary_breach`: the adapter reports that boundaries were not preserved.
- `stop_blocked`: a stop condition is blocked or unresolved.
- `residual_risk`: the report carries residual risks.

Profiles may add review conditions, but unknown conditions must be treated as
requiring human review.

The canonical clean state is an empty `reviewConditions` array. HACP 0.2 schemas
reject `["none"]`. Non-schema draft readers may tolerate older `["none"]`
examples during review, but v0.2 records should use `[]`.

Human decision records must preserve the review conditions surfaced by their
referenced match proof, either as the same set or as a profile-defined superset.
A decision record must not silently drop `boundary_breach`, `stale_handoff`,
`matrix_drift`, `stop_blocked`, or `residual_risk` from the proof it decides.

Review condition derivation is profile-specific, but the base profile uses these
minimum rules:

| Condition | Minimum derivation rule |
| --- | --- |
| `stale_handoff` | Handoff is expired or not the latest accepted handoff for the same authority/target tuple. |
| `matrix_drift` | The decision rule digest/version captured at handoff or report time differs from the current rule digest/version at review time. |
| `boundary_breach` | Adapter report has `boundariesPreserved = false` or non-empty boundary-crossed reasons. |
| `stop_blocked` | Adapter report has `stopConditionStatus = blocked`, `unknown`, or unresolved profile-specific stop status. |
| `residual_risk` | Adapter report has one or more residual risks. |

"Latest accepted handoff" is profile-defined. The base profile expects
consumers to compare handoffs for the same authority packet and target label by
creation time, and to treat a later non-expired handoff as superseding an
earlier one. Profiles that use sequence numbers, ledgers, or another ordering
source must declare that ordering rule.

`matrix_drift` requires a profile-visible decision rule version, digest, or
matrix identifier captured at handoff/report time and compared at review time.
Implementations that do not track such a rule identifier should not claim they
can prove the absence of matrix drift.

HACP 0.2 base does not define a full session-status decision matrix. Decision
values are closed in the base registry, while status transitions and
matrix-drift evidence are profile-defined.

### Requested Report Shape

`requestedReportShape` names the report record kind expected by the authority
packet. The HACP 0.2 base profile currently defines `hacp.adapter_report`.
Consumers must reject or route to human review when the returned report shape
does not match the authority packet's requested shape.

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

Implementation patterns are profile-specific. Common approaches include a
unique storage key for the idempotency tuple, or a transaction-local re-check
immediately before writing the durable record. If a state transition depends on
the durable record, both must commit together.

## Human Decision Confirmation

`confirmationText` is optional by default. Profiles may require it for decisions
that cancel work, accept boundary-breached reports, accept matrix-drift reports,
or otherwise acknowledge elevated risk. A confirmation text is an attestation,
not an execution instruction.

`reject_report` is human-only. Adapter reports can request a next step, but an
adapter cannot reject its own report on behalf of the human owner.

Human decision records use 16-character digest prefixes for human-readable
cross-reference only. They are not full integrity checks. Full digest comparison
belongs in authority packets, handoff packages, adapter reports, and match
proofs.

## v0.1 Compatibility

HACP 0.2 is a clean draft layer, not a backwards-compatible schema revision of
the v0.1 JSON records. v0.1 uses `snake_case` fields such as `hacp_version`;
v0.2 uses camelCase fields such as `schemaVersion`. v0.1 records may be used as
historical evidence or translated by a profile-specific adapter, but they are
not valid v0.2 records without translation.

v0.1 and v0.2 records may coexist in the same repository or audit archive, but
they should not be mixed inside one v0.2 custody chain unless a profile defines
an explicit translation record. There is no v0.1 deprecation timeline in this
draft.

## Audit Fail-Closed

If a state change depends on durable evidence, the evidence write and the state
change must succeed together or fail together. HACP 0.2 does not require a
specific database, but it does require implementations to document their
fail-closed strategy.

## Version Status

HACP 0.2 is not stable 1.0. It is a draft vocabulary and record model for
review, fixture building, and independent implementation feedback.
