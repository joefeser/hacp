# RFC-0009: Conformance and Profiles

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

Conformance defines what it means to implement HACP. Profiles define explicit,
named extensions to the base protocol. Together they prevent silent vocabulary
widening and make independent implementations reviewable.

## Base Profile

The base profile is the smallest HACP surface that can claim protocol
conformance. It includes:

- Motivation, scope, and invariants from RFC-0000;
- Task Packet semantics from RFC-0001;
- base authority vocabulary from RFC-0002;
- Agent Report semantics from RFC-0003;
- Review Finding semantics from RFC-0004;
- Human Decision Gate semantics from RFC-0005;
- Loop Ceiling semantics from RFC-0006 when iteration is used;
- Audit Trail and Evidence Set semantics from RFC-0007;
- Transport Boundary semantics from RFC-0008;
- conformance and profile rules from RFC-0009.

An implementation MUST NOT claim HACP base-profile conformance unless it
implements or explicitly rejects unsupported optional values according to the
applicable RFCs.

The base profile identity is:

```yaml
profile_id: hacp-base-draft
profile_version: v0.1-draft
```

All HACP records MUST carry both fields. Records using a different profile id or
version are not base-profile records.

## Profile Requirements

A profile MUST publish a profile declaration with:

- `profile_id`;
- `profile_version`;
- `profile_status`;
- base HACP draft or version;
- owner or publisher;
- added vocabulary;
- authority impact mappings;
- forbidden-effect declarations for added authority values;
- added fields;
- removed optional behaviour, if any;
- added conformance checks;
- compatibility and migration notes.

Profile declarations MUST be available to consumers before they process profiled
packets, reports, findings, decisions, or transport records.

Profile identifiers SHOULD use a globally namespaced form, such as
`org.example.hacp.profile-name` or a stable URL controlled by the profile
publisher. A profile declaration MUST identify where consumers can obtain the
declaration, either through a bundled artefact, a registry entry, or a stable
URL plus integrity metadata.

The base `profile_status` vocabulary is:

- `active`;
- `deprecated`;
- `revoked`.

Consumers MUST reject records that require a revoked profile. Consumers SHOULD
warn on deprecated profiles unless the local policy requires rejection.

The base profile declaration is published at
`profiles/hacp-base-draft-v0.1.yaml`.

The base draft includes minimal JSON Schemas for Task Packet and Agent Report
records in `schemas/`. These schemas are companion artefacts, not a
replacement for the human-readable RFCs.

## Compatibility

Profiles MAY add fields and vocabulary. Profiles MUST NOT redefine base field
semantics in an incompatible way.

A consumer that does not recognise a required profile MUST reject the profiled
record rather than treating unknown values as base-profile values. Rejection
means:

- the consumer MUST NOT process the record further;
- the consumer MUST NOT fall back to base-profile interpretation;
- the consumer MUST emit an auditable profile-mismatch event when an audit
  surface exists;
- automated transports MUST return a machine-readable error response;
- manual surfaces MUST present human-readable feedback.

Consumers MUST also reject records with a known `profile_id` and an unrecognised
`profile_version`; this includes future base-profile versions such as a
`hacp-base-draft` record marked `v0.2-draft` when the consumer only implements
`v0.1-draft`.

## Conformance Evidence

An implementation claiming conformance MUST provide evidence. Evidence MAY be:

- automated tests;
- property checks;
- schema validation;
- audit exports;
- manual conformance reports;
- independent implementation notes.

The evidence MUST identify the HACP draft or version and any profiles claimed.

At minimum, a `base_profile_draft` claim MUST include evidence for RFC-0000
through RFC-0009, including any RFC whose optional values were explicitly
rejected as unsupported.

## Conformance Levels

The draft defines these labels:

| Label | Meaning |
| --- | --- |
| `base_profile_draft` | Implements the current base draft across RFC-0000 through RFC-0009 without automated transport. |
| `profile_draft` | Implements a named profile extension. |
| `transport_profile_draft` | Implements automated transport under a published profile. |
| `delegated_authority_profile_draft` | Implements delegated approval, standing approval, or template pre-approval under a distinct non-base profile. |
| `non_conforming` | Uses HACP terms but violates base invariants. |

These labels are provisional and may change before v1.0.

## Non-Conforming Claims

The following claims are non-conforming:

- using HACP vocabulary while adding `ship` or `accept_risk` authority;
- adding an authority value without an authority impact mapping and
  forbidden-effect declaration;
- processing unknown profile values as if they were base values;
- claiming automated-transport conformance without publishing the transport
  profile;
- claiming `base_profile_draft` while adding delegated approval, standing
  approval, or template pre-approval;
- treating successful delivery, report import, or review agreement as approval;
- hiding decision-gate or audit evidence from reviewers.

## Versioning

Draft versions SHOULD be identified explicitly in packet and report metadata.
Implementations SHOULD avoid claiming unqualified "HACP compliant" status until
a v1.0 release exists.

Draft conformance labels SHOULD be reported with the HACP draft version, such as
`base_profile_draft-v0.1-draft`, so early tooling does not treat provisional
labels as stable v1.0 identifiers.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. every claimed RFC has a corresponding conformance check or manual evidence;
2. profile identifiers and profile versions are required for every record;
3. unknown required profiles are rejected;
4. forbidden authority effects are rejected;
5. transport conformance claims cite RFC-0008 evidence.

## Open Questions

- Should HACP maintain a public profile registry?
- What conformance label should be used for partial implementations?
- Should conformance reports be machine-readable?
