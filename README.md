# Human-Approved Coordination Protocol (HACP)

HACP is a working-draft protocol for accountable delegation among humans,
agents, and tools.

The draft is evidence-led. It comes from practical implementation experience
with human-approved task packets, agent reports, review findings, decision
gates, bounded iteration, and audit evidence. The public draft keeps the
reusable contracts and leaves product-specific implementation details out of
scope.

## Status

HACP is not a standard yet. It is a working draft based on practical experience
building and dogfooding one implementation. Vendor-neutrality is a design goal;
achieving it requires independent implementations and feedback from tool owners
who did not inherit the original implementation context.

This repository is intended for public review of the draft contracts. Do not
describe an implementation as "HACP compliant" yet; use narrower labels such as
"implements the HACP v0.1 draft base profile" and cite the evidence that was
checked.

## Draft RFC Index

| RFC | Title | Status |
| --- | --- | --- |
| [RFC-0000](rfcs/0000-motivation-and-scope.md) | Motivation and Scope | Draft |
| [RFC-0001](rfcs/0001-task-packet.md) | Task Packet | Draft |
| [RFC-0002](rfcs/0002-authority-vocabulary-and-profiles.md) | Authority Vocabulary and Profiles | Draft |
| [RFC-0003](rfcs/0003-agent-report.md) | Agent Report | Draft |
| [RFC-0004](rfcs/0004-review-finding.md) | Review Finding | Draft |
| [RFC-0005](rfcs/0005-human-decision-gate.md) | Human Decision Gate | Draft |
| [RFC-0006](rfcs/0006-loop-ceiling-and-bounded-iteration.md) | Loop Ceiling and Bounded Iteration | Draft |
| [RFC-0007](rfcs/0007-audit-trail-and-evidence-set.md) | Audit Trail and Evidence Set | Draft |
| [RFC-0008](rfcs/0008-transport-boundary.md) | Transport Boundary | Draft |
| [RFC-0009](rfcs/0009-conformance-and-profiles.md) | Conformance and Profiles | Draft |

## v0.1 Completeness

The current draft set is minimally reviewable as a v0.1 protocol sketch. It is
not a standard, and it should not be described as vendor-neutral until at least
two independent implementations validate the contracts.

HACP v0.1 base-profile conformance depends on these RFCs remaining mutually
consistent:

- RFC-0000 Motivation and Scope
- RFC-0001 Task Packet
- RFC-0002 Authority Vocabulary and Profiles
- RFC-0003 Agent Report
- RFC-0004 Review Finding
- RFC-0005 Human Decision Gate
- RFC-0006 Loop Ceiling and Bounded Iteration
- RFC-0007 Audit Trail and Evidence Set
- RFC-0008 Transport Boundary
- RFC-0009 Conformance and Profiles

Profile extensions are only conforming when they meet RFC-0009 and preserve the
invariants in RFC-0000. Automated transport claims additionally depend on the
RFC-0008 transport-boundary checks.

## Dependency Map

| Area | Depends on |
| --- | --- |
| A packet can grant bounded authority | RFC-0000, RFC-0001, RFC-0002, RFC-0005 |
| A returned report can be reviewed | RFC-0001, RFC-0003, RFC-0004, RFC-0007 |
| Review/fix loops remain bounded | RFC-0004, RFC-0005, RFC-0006, RFC-0007 |
| Manual transport remains non-authorising | RFC-0001, RFC-0005, RFC-0008 |
| Automated transport can claim conformance | RFC-0008, RFC-0009 |

## Core Invariants

1. Human authority is explicit and cannot be silently delegated away.
2. Authority comes from an approved task packet, not from the mechanism that
   transports the packet.
3. Manual and automated transport are different layers. Moving a packet does not
   widen the packet's authority.
4. Closed vocabularies must not silently widen. Profiles may extend them only
   under declared conformance rules.
5. Reports, findings, decisions, and audit evidence must be readable by humans
   and mechanically checkable by tools.

## Public Review Scope

The public review surface is intentionally small:

- the RFC drafts in [rfcs/](rfcs/);
- the base profile declaration in
  [profiles/hacp-base-draft-v0.1.yaml](profiles/hacp-base-draft-v0.1.yaml);
- the base decision matrix in
  [decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml);
- the draft schemas in [schemas/](schemas/);
- the minimal end-to-end example in
  [examples/minimal-v0.1/](examples/minimal-v0.1/).

Implementation-specific trial artefacts are not required to review this public
draft. Future releases may add public evidence bundles, conformance test
fixtures, and independent implementation reports.

## Reviewer Packet

Use [review-packet.md](review-packet.md) when asking another model, reviewer, or
tool owner to assess the v0.1 draft set. It keeps the review focused on
protocol risks instead of wording polish.

## Reference Example

Use [examples/minimal-v0.1/README.md](examples/minimal-v0.1/README.md) for a
small end-to-end fixture: one approved packet, one returned report, one review
finding, and one JSON Lines audit export. It is intentionally tiny, so protocol
reviewers can test the RFC contracts without inheriting an implementation's
private evidence tree.

## Contributing

HACP is still pre-standardisation work. The most useful contributions are:

- protocol-risk findings ordered by severity;
- contradictions between RFCs, schemas, examples, and the decision matrix;
- evidence that a contract is not independently implementable;
- small interoperability fixtures or schema-validation cases.

Use [review-packet.md](review-packet.md) for a focused review prompt, and see
[CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations.

## License

See [LICENSE.md](LICENSE.md). The draft prose is offered under CC BY 4.0, and
machine-readable artefacts, examples, and validation fixtures are offered under
Apache-2.0 unless a file states otherwise.

## Machine-Readable Draft Artefacts

- [profiles/hacp-base-draft-v0.1.yaml](profiles/hacp-base-draft-v0.1.yaml):
  base profile declaration, authority mappings, and forbidden-effect
  declarations.
- [decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml): base Human
  Decision Gate status-transition matrix.
- [schemas/task-packet.schema.json](schemas/task-packet.schema.json): minimal
  JSON Schema for base Task Packet records.
- [schemas/agent-report.schema.json](schemas/agent-report.schema.json): minimal
  JSON Schema for base Agent Report records.
