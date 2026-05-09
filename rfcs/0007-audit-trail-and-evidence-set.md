# RFC-0007: Audit Trail and Evidence Set

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

HACP evidence is not an optional log. It is the durable record that lets a human
or independent reviewer verify what authority was granted, what work occurred,
what decisions were made, and why a recommendation is trustworthy.

## Audit Trail

An audit trail MUST record authority-relevant events, including:

- Task Packet creation;
- Task Packet approval;
- Human Decision Gate actions;
- Agent Report import or receipt;
- Review Finding creation;
- loop ceiling increments or breaches;
- transport events when automated transport is used;
- terminal closeout.

Audit records MUST include:

- `hacp_version`;
- `record_kind`;
- `audit_id`;
- `profile_id`;
- `profile_version`;
- `target_kind`;
- `target_id`;
- `event_type`;
- `actor_id`;
- `created_at`;
- `reason` or event summary;
- profile-defined payload snapshot.

Audit payloads SHOULD avoid storing full packet/report bodies when a stable
reference is available. Payloads MUST NOT include credentials.

The base `event_type` vocabulary is:

| Event type | Meaning |
| --- | --- |
| `packet.created` | A Task Packet draft was created. |
| `packet.approved` | A Task Packet became authoritative through a Human Decision Gate. |
| `decision.recorded` | A Human Decision Gate action was accepted or rejected. |
| `report.imported` | An Agent Report was received or imported. |
| `finding.created` | A Review Finding was recorded. |
| `finding.paired` | A `real_blocker` Review Finding was paired with a decision, packet, terminal state, or human explanation. |
| `loop.incremented` | The loop counter changed. |
| `loop.breached` | The loop ceiling was exceeded or required human decision. |
| `transport.rendered` | A packet or report was rendered for transport. |
| `transport.delivered` | Automated transport delivered a packet or report. |
| `session.closed` | The coordination session reached terminal closeout. |

Profiles MAY add event types through RFC-0009, but base event semantics MUST NOT
be redefined.

The base `record_kind` for audit records is `hacp.audit_event`.

The base `target_kind` vocabulary is:

- `task_packet`;
- `agent_report`;
- `review_finding`;
- `human_decision_gate`;
- `coordination_session`;
- `transport_event`;
- `profile_declaration`.

Profiles MAY add target kinds through RFC-0009, but base target semantics MUST
NOT be redefined.

## Evidence Set

An Evidence Set is the collection of artefacts cited by packets, reports,
findings, decisions, and closeout recommendations.

Evidence MAY include:

- packet renderings;
- report renderings;
- audit exports;
- command transcripts;
- screenshots;
- review notes;
- evidence indexes;
- machine-readable schemas;
- signed attestations.

Evidence references MUST be stable within the implementation's review context.
Repository-relative paths are preferred for repository-local evidence.
Evidence references MUST remain resolvable for the duration of the coordination
session plus the profile-defined retention period. Repository-local evidence
MUST include commit identifiers or another immutable revision reference when the
evidence may outlive the working tree state or is exported for independent
review. Temporary filesystem paths are not stable evidence references.

An audit export for a session is not valid evidence for records that preceded
the export unless the cited export already existed at that earlier record time.
Reports SHOULD cite packet renderings, transcripts, diffs, screenshots, or other
evidence available at report time; the final audit export then links those
records together.

## Exportability

An implementation MUST provide an exportable evidence view sufficient for
independent review. Exported evidence MUST include enough context to trace:

1. the packet authority;
2. the decisions that changed status or routing;
3. the reports returned;
4. the findings recorded;
5. the final recommendation or closeout state.

The base portable audit export format is JSON Lines (`.jsonl`) with one JSON
object per audit or evidence-index record. Implementations MAY also provide
Markdown, HTML, PDF, or product-native views for humans, but a base-profile
conformance claim MUST include a JSON Lines export or a profile-declared
equivalent machine-readable format.

The base profile does not require cryptographic signatures, but automated
transport profiles MUST define integrity checks under RFC-0008. Other profiles
MAY require signatures or tamper-evident logs.

## Redaction

Evidence exports MUST NOT include credentials, secrets, raw bearer tokens,
session cookies, private keys, or customer data outside the profile's allowed
visibility.

If redaction occurs, the Evidence Set SHOULD include a redaction catalogue that
states what class of data was redacted and why.

## Aggregate Evidence

Metrics and aggregate claims MUST cite either:

- every underlying evidence item; or
- an evidence index that enumerates those items.

A single representative artefact is not sufficient evidence for an aggregate
count.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. authority-relevant events emit audit records;
2. exported evidence links packets, reports, decisions, findings, and closeout;
3. evidence exports contain no credentials;
4. aggregate claims cite per-instance evidence or an evidence index;
5. redactions are catalogued when applied;
6. base audit exports are available as JSON Lines or a declared profile
   equivalent;
7. `real_blocker` pairings emit `finding.paired` audit events.

## Open Questions

- Should HACP require tamper-evident audit logs in v1.0?
- Should evidence references use URI syntax?
