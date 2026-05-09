# HACP v0.1 Reviewer Packet

Use this packet when asking another model, reviewer, or tool owner to review the
HACP v0.1 draft set. The goal is protocol risk review, not implementation
review.

## Context

HACP is the Human-Approved Coordination Protocol. It extracts reusable
coordination contracts from practical human-agent collaboration workflows into
an RFC-style draft set.

The protocol is intentionally narrower than an agent framework. It does not
define model context exchange, tool discovery, agent identity, or execution
syntax. It defines accountable delegation: who approved a packet, what authority
was granted, what evidence returned, what findings were recorded, and where
human judgement remained required.

The core invariant is:

> Human authority comes from the approved task packet and Human Decision Gate
> records, not from the mechanism that transports the packet.

HACP is not a standard yet. Vendor-neutrality is a design goal that still needs
independent implementations.

## Files To Review

- `README.md`
- `rfcs/0000-motivation-and-scope.md`
- `rfcs/0001-task-packet.md`
- `rfcs/0002-authority-vocabulary-and-profiles.md`
- `rfcs/0003-agent-report.md`
- `rfcs/0004-review-finding.md`
- `rfcs/0005-human-decision-gate.md`
- `rfcs/0006-loop-ceiling-and-bounded-iteration.md`
- `rfcs/0007-audit-trail-and-evidence-set.md`
- `rfcs/0008-transport-boundary.md`
- `rfcs/0009-conformance-and-profiles.md`

Useful evidence background:

- `examples/minimal-v0.1/README.md`
- `profiles/hacp-base-draft-v0.1.yaml`
- `decision-matrix-base-v0.1.yaml`
- `schemas/task-packet.schema.json`
- `schemas/agent-report.schema.json`

## Focus Questions

Return findings ordered by severity. Prefer protocol risks over wording polish.

1. Is HACP meaningfully distinct from MCP, tool-calling protocols, and agent
   frameworks?
2. Is the authority invariant sharp enough: authority comes from the approved
   packet and decision records, not transport?
3. Are delegated approval, standing approval, and template pre-approval closed
   tightly enough for v0.1?
4. Are `ship`, `accept_risk`, and effect-equivalent authority values excluded
   structurally rather than only by label?
5. Is RFC-0008 strong enough for future CLI and file-watcher bridges?
6. Do profile extensions require enough declaration, versioning, and consumer
   rejection behaviour to prevent silent vocabulary widening?
7. Are Human Decision Gate records and audit/evidence exports sufficient for
   independent review?
8. Does any draft overclaim standard, vendor-neutral, or conformance maturity?
9. Is the RFC decomposition appropriate for v0.1, or should any RFC be merged,
   split, or promoted as blocking?

## Non-Goals For This Review

- Do not review the source implementation unless a protocol claim depends
  on it.
- Do not propose an in-app shell, direct model API orchestration, service bus,
  or outbound notification fan-out.
- Do not add `ship`, `accept_risk`, production deploy, or risk-acceptance
  authority to the HACP vocabulary.
- Do not treat successful transport, report import, or review agreement as
  approval.

## Expected Output

Use this shape:

```text
Findings, ordered by severity:

1. Severity — Title
   - File/section:
   - Why it matters:
   - Recommended change:

Summary:
- Distinction from MCP/tool calling:
- Core invariant:
- Transport boundary:
- Vendor-neutrality / standard-status claims:
- v0.1 decomposition:
```
