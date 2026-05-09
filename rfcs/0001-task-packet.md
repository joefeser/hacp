# RFC-0001: Task Packet

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

A Task Packet is the HACP record that grants bounded authority for a specific
unit of work. It tells an agent, tool, or human reviewer what may be done, what
must not be done, how the work stops, and what evidence must return.

The Task Packet is the primary source of delegated authority in HACP. Transport
mechanisms move packets; they do not reinterpret them.

## Requirements

### Packet Instance

Every Task Packet MUST be an instance-specific record. A packet MAY be generated
from a template, but template approval is not packet approval in the HACP base
profile.

Every Task Packet MUST include:

- `hacp_version`;
- `record_kind`;
- `packet_id`;
- `profile_id`;
- `profile_version`;
- `packet_state`;
- `created_at`;
- `created_by`;
- `approval`;
- `target_label`;
- `mode`;
- `authority`;
- `authority_impact`;
- `scope`;
- `allowed_surfaces`;
- `forbidden_surfaces`;
- `stop_conditions`;
- `verification_requirements`;
- `required_report_shape`;
- `evidence_visibility`.

The HACP base profile uses `profile_id: hacp-base-draft` and
`profile_version: v0.1-draft`. Profile identity fields are required even when no
extension is used so consumers can reject records from unknown future drafts
instead of silently interpreting them as base records.

The `hacp_version` field identifies the protocol draft version. For this draft
set, records use `hacp_version: v0.1-draft`. It MUST NOT be used to carry the
defining RFC number.

The base Task Packet `record_kind` is `hacp.task_packet`. Consumers MUST reject
unknown `record_kind` values unless a declared profile extends the vocabulary.

### Approval Reference

The `approval` field is the packet's link to the Human Decision Gate record that
made the packet authoritative.

For a draft packet, `packet_state` MUST be `draft` and `approval` MUST be null.
For an approved or transportable packet, `packet_state` MUST be `approved` and
`approval` MUST include:

- `decision_id`;
- `actor_id`;
- `actor_kind`;
- `approved_at`;
- `approved_body_hash`.

A packet without a populated approval reference is not authority. Manual
recipients and automated transports MUST treat it as a draft, even if its other
fields look complete.

Approved packet bodies are immutable for the lifetime of their approval. Any
substantive change to an approved packet's authority, scope, stop conditions,
surfaces, transport contract, or required report shape MUST invalidate the
approval and require a new Human Decision Gate.

The `approved_body_hash` value MUST identify the canonical approved packet body.
The base profile does not prescribe a canonicalisation algorithm for v0.1, but
the algorithm name MUST be included with the digest. Automated transport
profiles MUST define canonicalisation and verification rules in their profile.

### Human Readability

The canonical packet rendering SHOULD be human-readable Markdown or a similarly
reviewable format. A machine-readable rendering MAY accompany it, but the
machine-readable form MUST NOT contain authority that is absent from the
human-readable form.

### Scope

The `scope` field MUST describe the intended work in bounded language.

The `allowed_surfaces` field MUST identify where work may occur. Surfaces MAY be
file paths, repository paths, API surfaces, documents, systems, or other
profile-defined targets.

The `forbidden_surfaces` field MUST identify explicitly excluded areas when
exclusion is needed to preserve authority boundaries.

If an implementation cannot represent a scope boundary precisely, it MUST choose
a narrower boundary or stop for human decision.

### Mode And Authority

The `mode` field describes the kind of work requested. The `authority` field
describes what the recipient may do while performing that work.

The `authority_impact` field declares the closed impact class for the authority
value. The base profile defines authority values and impact classes in RFC-0002.
A Task Packet MUST NOT contain `ship`, `accept_risk`, or any value with
equivalent effect.

### Stop Conditions

Task Packets MUST define stop conditions. A stop condition is an event that ends
the recipient's authority to continue without another Human Decision Gate.

At minimum, packets MUST stop when:

- the required outcome is complete;
- a required input is unavailable;
- the work would require a forbidden surface;
- a blocker or safety concern invalidates the packet's scope;
- a requested action would exceed the packet's authority.

### Required Report Shape

Every Task Packet MUST declare the report shape expected in response. The report
shape MAY reference RFC-0003 directly or a profile-specific extension.

The recipient MUST return an Agent Report or an explicit non-delivery record.
Silent disappearance is not HACP-conforming.

### Evidence Visibility

The base evidence visibility vocabulary is:

| Value | Meaning |
| --- | --- |
| `internal_only` | Evidence is intended only for the approving organisation or operator context. |
| `reviewer_only` | Evidence may be shared with explicitly named reviewers. |
| `external_shareable` | Evidence may be shared outside the approving organisation after required redaction checks. |

Profiles MAY extend this vocabulary only through RFC-0009 profile declarations.

### Loop Ceiling Visibility

If a coordination session permits iterative review/fix work, the Task Packet
rendering MUST show the effective loop ceiling that applies at approval time.
The value MAY be stored on the session rather than the packet, but it MUST be
visible in the packet approval surface or exported packet rendering. If a
service default is used, the rendered packet MUST show the resolved default, not
only the word `default`.

The rendered value is the effective ceiling at approval time and MUST NOT change
retroactively if a later session default changes.

## Minimal Example

```yaml
hacp_version: v0.1-draft
record_kind: hacp.task_packet
packet_id: packet-2026-05-09-001
profile_id: hacp-base-draft
profile_version: v0.1-draft
packet_state: approved
created_at: 2026-05-09T08:00:00Z
created_by: operator-1
approval:
  decision_id: decision-2026-05-09-001
  actor_id: human-operator-1
  actor_kind: human
  approved_at: 2026-05-09T08:05:00Z
  approved_body_hash:
    algorithm: sha256
    canonicalization: hacp-yaml-v0.1
    digest: sha256:example-approved-body-digest
target_label: codex-cli
mode: implement
authority: implement_bounded
authority_impact: modifies_allowed_surfaces
scope: Correct stale wording in docs/example.md.
allowed_surfaces:
  - docs/example.md
forbidden_surfaces:
  - app/**
  - prisma/**
stop_conditions:
  - Stop after the documentation correction and verification transcript.
  - Stop if the correction requires source code changes.
verification_requirements:
  - git diff -- docs/example.md
required_report_shape: hacp-agent-report-draft
evidence_visibility: internal_only
loop_ceiling: 3
```

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. packet renderings include all required fields;
2. machine-readable packet renderings do not contain authority absent from the
   human-readable rendering;
3. forbidden authority values are rejected;
4. packets with missing stop conditions are rejected;
5. packets without approval references are not consumed as authority;
6. profile identifiers and profile versions are present;
7. evidence visibility values are drawn from the base or declared profile
   vocabulary;
8. approved packet changes invalidate the prior approval unless the approved
   body hash still matches.

## Open Questions

- Should packet signatures be required in the base profile?
- Should `target_label` remain informational, or should profiles define target
  identity constraints?
- Which path/surface syntax should be recommended for repository work?
