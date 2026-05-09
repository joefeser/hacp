# RFC-0003: Agent Report

Status: Draft

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

An Agent Report is the required response to a Task Packet. It records what was
done, what evidence was produced, what remains risky, and what human decision or
next packet is requested.

Reports are part of the authority chain. They do not approve themselves and they
do not widen packet authority.

## Required Fields

Every Agent Report MUST include:

- `hacp_version`;
- `record_kind`;
- `report_id`;
- `packet_id`;
- `profile_id`;
- `profile_version`;
- `created_at`;
- `created_by`;
- `files_changed` or `surfaces_changed`;
- `behaviour_implemented`;
- `verification_performed`;
- `blockers`;
- `residual_risks`;
- `requested_next_step`;
- `boundaries_preserved`;
- `boundary_crossed_reason`;
- `evidence`.

An implementation MAY use different field names in a profile, but it MUST map
them to the base semantics.

The base Agent Report `record_kind` is `hacp.agent_report`.

## Boundary Preservation

The `boundaries_preserved` field MUST be a boolean in the base profile.

If `boundaries_preserved` is false, `boundary_crossed_reason` MUST say which
boundary was crossed and the report MUST request human decision. It MUST NOT
present the work as ready. If `boundaries_preserved` is true,
`boundary_crossed_reason` MUST be null or an empty list.

## Evidence

Reports MUST cite evidence using stable references. Evidence MAY be:

- repository-relative paths;
- audit record identifiers;
- transcript paths;
- command outputs;
- screenshots;
- signed attestations;
- profile-defined evidence objects.

Reports MUST NOT rely only on prose claims when mechanical evidence exists.

## Blockers And Residual Risks

`blockers` describe issues that prevented completion under the packet authority.

`residual_risks` describe known uncertainty after the work. Residual risk MUST
NOT be treated as accepted risk. Accepting risk is human-only and outside the
base HACP authority vocabulary.

## Requested Next Step

The requested next step is advisory. It MUST NOT alter status or authority until
a Human Decision Gate records the decision.

Examples include:

- `request_review`;
- `approve_next_packet`;
- `accept_follow_up`;
- `mark_blocked`;
- `mark_complete`;
- profile-defined values.

The report MAY request a next step that is later rejected by the decision gate.
The decision gate is authoritative.

## Minimal Example

```yaml
hacp_version: v0.1-draft
record_kind: hacp.agent_report
report_id: report-2026-05-09-001
packet_id: packet-2026-05-09-001
profile_id: hacp-base-draft
profile_version: v0.1-draft
created_at: 2026-05-09T09:00:00Z
created_by: codex-cli
surfaces_changed:
  - docs/example.md
behaviour_implemented: Updated stale phase wording.
verification_performed:
  - git diff -- docs/example.md
blockers: []
residual_risks:
  - No docs lint command exists.
requested_next_step: request_review
boundaries_preserved: true
boundary_crossed_reason: null
evidence:
  - docs/trial/transcript-01-diff.log
```

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. reports missing required fields are rejected;
2. reports cannot change packet authority;
3. `requested_next_step` remains advisory until a Human Decision Gate;
4. boundary violations cannot be reported as `boundaries_preserved: true`;
5. evidence references are syntactically valid for the chosen profile.

## Open Questions

- Should reports require signatures in the base profile?
- Should `files_changed` and `surfaces_changed` be one field or profile-specific?
- Should duplicate report import be specified in base HACP or a profile?
