# RFC-0004: Review Finding

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

A Review Finding records a reviewer judgement about a Task Packet, Agent Report,
evidence item, or protocol artefact. Findings make review outcomes durable and
machine-checkable without converting review agreement into human approval.

## Required Fields

Every Review Finding MUST include:

- `hacp_version`;
- `record_kind`;
- `finding_id`;
- `target_id`;
- `target_kind`;
- `profile_id`;
- `profile_version`;
- `reviewer_label`;
- `severity`;
- `classification`;
- `title`;
- `body`;
- `evidence`;
- `created_at`;
- `created_by`.

The base Review Finding `record_kind` is `hacp.review_finding`.

## Severity

The base severity vocabulary is:

| Severity | Display label | Meaning |
| --- | --- | --- |
| `blocker` | Blocker | The target cannot honestly proceed until addressed or explicitly stopped. |
| `high` | High | The target may mislead, violate authority, or create material downstream risk. |
| `medium` | Medium | The target has a substantive issue that should be addressed but does not invalidate the whole target. |
| `low` | Low | The target has a minor issue, polish concern, or non-blocking precision problem. |

Severity describes impact. It does not describe whether the finding should be
fixed now. Machine-readable severity tokens in the base profile MUST be
lowercase. Display labels MAY be capitalised for human presentation.

## Classification

The base classification vocabulary is:

| Classification | Meaning |
| --- | --- |
| `real_blocker` | Must be paired with a Human Decision Gate response or explicit stop. |
| `follow_up` | Should be addressed or tracked, but does not block honest continuation. |
| `noise` | Recorded for audit completeness but does not require action. |
| `needs_human_decision` | Requires human judgement before classification or disposition is final. |
| `confirmation` | Records positive confirmation that a property or boundary was preserved. |

Classification describes disposition. It MUST be independent from severity even
when implementations choose common pairings.

## Evidence

Findings MUST cite the evidence they judge. Evidence references SHOULD be narrow
enough for another reviewer to locate the issue without re-performing the whole
review.

Findings SHOULD avoid bare aggregate claims unless an evidence index enumerates
the underlying instances.

## Real Blocker Pairing

Every `real_blocker` finding MUST be paired with one of:

- a Human Decision Gate action that addresses the blocker;
- a subsequent Task Packet scoped to the blocker;
- a terminal decision such as cancel or blocked;
- a documented human explanation for no action.

An implementation MUST NOT ignore a `real_blocker` and still claim ready/closed
status.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. severities are drawn from the closed base vocabulary or declared profile;
2. classifications are drawn from the closed base vocabulary or declared profile;
3. findings cite evidence;
4. `real_blocker` findings cannot be silently left unpaired;
5. findings cannot mutate the target packet or report by themselves.

## Open Questions

- Should reviewer identity be a protocol identity or a profile label?
- Should HACP define finding suppression or duplicate detection?
- Should evidence references use URI syntax, repository-relative paths, or both?
