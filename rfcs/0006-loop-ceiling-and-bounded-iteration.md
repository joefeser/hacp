# RFC-0006: Loop Ceiling and Bounded Iteration

Status: Draft

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

A Loop Ceiling is a bound on repeated review/fix or review/follow-up cycles. It
prevents agentic collaboration from becoming an unbounded loop that keeps the
human out of the authority path.

## Requirements

### Ceiling Definition

An HACP coordination session that permits iterative review/fix work MUST define
a loop ceiling or explicitly state that the session is single-pass.

The ceiling MUST be a concrete non-negative integer or a profile-defined bound.
A value of `0` means single-pass: no additional review/fix packet may be
approved after the first returned report or finding without another human
decision path defined by the profile. The default MUST be visible to the human
owner before the session begins.

### Counter Semantics

The base profile increments the loop counter when a Human Decision Gate approves
another packet for the same session after at least one Agent Report or Review
Finding has already returned for the prior packet cycle. This measures
additional human-approved review/fix iteration rather than initial packet
approval.

A single-pass session that completes after the first report and finding without
approving another packet therefore closes with `loop_counter = 0`.

Profiles MAY override the increment trigger only through RFC-0009 profile
declaration. The trigger MUST be deterministic and auditable.

The counter MUST NOT be incremented by report import, review finding creation,
transport success, or agent completion unless a profile explicitly defines a
different auditable trigger.

Every loop increment audit event MUST include a `triggering_condition` value,
such as `post_report_approval` or `post_finding_approval`, plus the triggering
Human Decision Gate id.

### Ceiling Breach

When the counter exceeds the ceiling, the implementation MUST route to human
decision or terminal stop. It MUST NOT continue silently.

The breach record MUST include:

- previous counter;
- new counter;
- ceiling;
- triggering decision;
- reason;
- next required human action.

### Overrides

The base profile permits human override only through a Human Decision Gate.
Overrides MUST include a reason and MUST be auditable.

Automated systems MUST NOT raise, bypass, or reset the loop ceiling.

## Outcomes

Implementations SHOULD classify loop outcomes using profile-defined values such
as:

- `normal_completion`;
- `ceiling_breach`;
- `unobserved`;
- `canceled`;
- `blocked`.

An `unobserved` outcome is honest when the implementation cannot prove normal
completion or ceiling breach from available evidence.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. the loop ceiling is visible;
2. the counter increments only at the base or profile-declared trigger;
3. ceiling breach routes to human decision or terminal stop;
4. automated code cannot override the ceiling;
5. final reports cite the loop outcome and counter.

## Open Questions

- Should the default ceiling be standardised?
- How should nested review loops be counted?
