# Human-Approved Coordination Protocol (HACP)

Copyright (c) 2026 Joe Feser.

Website: [hacp.io](https://www.hacp.io/)

HACP is a working-draft protocol for accountable delegation among humans,
agents, and tools.

The draft is evidence-led. It comes from practical implementation experience
with human-approved task packets, agent reports, review findings, decision
gates, bounded iteration, and audit evidence. The public draft keeps the
reusable contracts and leaves product-specific implementation details out of
scope.

## Why HACP Exists

Teams are starting to use agents and automation for real work, but the approval
trail is often still a mix of chat history, screenshots, ticket comments, and
human memory. That is fragile when the work can affect customers, executives,
orders, listings, communications, deployments, business records, or other
authority-bearing workflows.

HACP is for the moment when a human wants help from agents or tools, but still
needs to know:

- what was approved;
- who or what received the work;
- what evidence came back;
- whether the work stayed inside scope;
- which human accepted, rejected, revised, canceled, or completed the work.

Bounded work means work with an explicit, human-approved scope that the
participant is not allowed to exceed.

HACP provides a record model for accountable delegation:

1. A human approves a bounded work packet.
2. The packet is carried to an agent, tool, adapter, or human workflow
   participant.
3. The participant returns structured evidence.
4. The returned work is matched to the approved packet.
5. A human records a decision such as accept follow-up, mark complete, request
   revision, reject report, cancel session, or request continued human review.

The goal is not unchecked autonomy. The goal is useful automation with explicit
human gates where risk, authority, customer impact, cost, or organizational
policy requires review. In HACP, reports are evidence, not authorization.

## HACP and Human-in-the-Loop

Human-in-the-loop (HITL) is the broad workflow pattern: a human reviews,
approves, rejects, escalates, or accepts responsibility at selected points in an
automated or AI-assisted workflow.

HACP is narrower. It is a protocol-shaped approach inside the broader HITL
family, focused on accountable delegation and chain of custody. HACP records
what a human approved, who or what received the work, what evidence came back,
whether that evidence matched the approved boundary, and which human decision
followed.

Not every HITL workflow needs HACP. HACP is most useful when an output might be
mistaken for authority: a report may look final, a recommendation may create
action pressure, or a pre-flight check may be treated as a go/no-go decision. In
HACP, those outputs remain evidence until a human decision record accepts,
rejects, revises, cancels, or completes the next step.

For concrete examples, start with the explanatory
[HACP use cases](docs/use-cases.md).
If you are asking "what problem does this solve?", that page is the best first
read before the protocol vocabulary. Its
[terms section](docs/use-cases.md#terms-used-in-these-examples) defines
reader-facing terms such as owner system, authority, consequential state change,
and matrix drift.

## Status

HACP is not a standard yet. It is a working draft based on practical experience
building and dogfooding one implementation. Vendor-neutrality is a design goal;
achieving it requires independent implementations and feedback from tool owners
who did not inherit the original implementation context.

This repository is intended for public review of the draft contracts. Do not
describe an implementation as "HACP compliant" yet; use narrower labels such as
"implements the HACP v0.1 draft base profile" and cite the evidence that was
checked.

## Stability Lanes

### Stable Enough To Use Now

- draft artifact vocabulary for packets, reports, stops, findings, and
  decisions;
- draft JSON Schema pack for machine-checkable artifact shape and vocabulary;
- valid/invalid example corpus with manifest expectations;
- local `hacp:doctor` validation flow for repeatable draft checks;
- explicit authority boundary language that keeps approval and risk acceptance
  human-owned.

### Experimental Or Product-Proven But Not Standardized

- product-specific UX/readback and governance workflows;
- cross-vendor interoperability claims without independent implementations;
- any claim that schema validation alone proves operational safety;
- any maturity framing that implies a finalized or ratified standard.

Use these lanes when describing HACP externally: "working draft with proven
local evidence" is accurate; "formal standard" is not.

## HACP 0.2 Draft

HACP 0.2 is a new experimental protocol draft that frames HACP as a
chain-of-custody protocol for human-authorized agent work. It adds handoff
packages, match proofs, human decision records, digest domains, and explicit
transport/execution profile separation.

Here, chain of custody means each report can be traced back to the exact
human-approved work boundary it claims to answer.

Start here:

- [docs/use-cases.md](docs/use-cases.md): explanatory human-facing examples
  of where HACP can help and how ordinary workflows map to protocol records.
- [docs/hacp-0.2.md](docs/hacp-0.2.md): core vocabulary, lifecycle, record
  model, digest domains, and audit/replay posture.
- [docs/profiles.md](docs/profiles.md): transport profiles and execution
  profiles, with registry values in
  [profiles/hacp-base-draft-v0.2.yaml](profiles/hacp-base-draft-v0.2.yaml).
- [docs/security-boundaries.md](docs/security-boundaries.md): authority,
  report, match-proof, human-decision, digest-domain, and fail-closed
  boundaries.
- [docs/non-goals.md](docs/non-goals.md): what HACP 0.2 does not define.
- [docs/review-packet.md](docs/review-packet.md): severity-ordered review
  packet for the 0.2 draft.

HACP 0.2 is not 1.0. It is a draft vocabulary and fixture set for review and
independent implementation feedback.

For maturity framing across v0.1 and v0.2, see
[Stability Lanes](#stability-lanes).

## Public Review

The preferred place for early v0.1 feedback is
[Discussion #2: HACP v0.1 public review](https://github.com/joefeser/hacp/discussions/2). HACP 0.2 is a
newer experimental draft; use [docs/review-packet.md](docs/review-packet.md)
when asking for focused 0.2 protocol review.

Please use that thread for broad feedback, protocol risks, implementation
questions, and "does this framing work?" reactions. For structured v0.1
protocol reviews, consider using the [review-packet.md](review-packet.md)
template.

Use issues for concrete defects such as contradictions between RFCs, schema
bugs, broken examples, or unclear conformance requirements.

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

## HACP 0.2 Draft Status

HACP 0.2 is an experimental public draft, not a stable conformance target. It
is reviewable through the 0.2 docs, schemas, profile registry, and fixtures
listed above. It should not be described as HACP 1.0 or as generally compliant
until independent implementations and conformance fixtures exist.

## HACP v0.1 Draft Completeness

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

The v0.1 public review surface is intentionally small:

- the RFC drafts in [rfcs/](rfcs/);
- the base profile declaration in
  [profiles/hacp-base-draft-v0.1.yaml](profiles/hacp-base-draft-v0.1.yaml);
- the base decision matrix in
  [decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml);
- the draft schemas in [schemas/](schemas/);
- the minimal end-to-end example in
  [examples/minimal-v0.1/](examples/minimal-v0.1/).

The v0.2 public review surface is the draft chain-of-custody packet:

- [docs/use-cases.md](docs/use-cases.md) as explanatory context;
- [docs/hacp-0.2.md](docs/hacp-0.2.md);
- [docs/profiles.md](docs/profiles.md);
- [docs/security-boundaries.md](docs/security-boundaries.md);
- [docs/non-goals.md](docs/non-goals.md);
- [profiles/hacp-base-draft-v0.2.yaml](profiles/hacp-base-draft-v0.2.yaml);
- the v0.2 schemas in [schemas/](schemas/);
- the v0.2 fixtures in [fixtures/happy-path/](fixtures/happy-path/) and
  [fixtures/risk-cases/](fixtures/risk-cases/).

Implementation-specific trial artefacts are not required to review this public
draft. Future releases may add public evidence bundles, conformance test
fixtures, and independent implementation reports.

## Reviewer Packet

Use [review-packet.md](review-packet.md) when asking another model, reviewer, or
tool owner to assess the v0.1 draft set. Use
[docs/review-packet.md](docs/review-packet.md) for HACP 0.2. Both keep the
review focused on protocol risks instead of wording polish.

## Public Site Content Spine

Use [site/README.md](site/README.md) as the plain-language HACP public
explainer. It summarizes the value, lifecycle, artifacts, validation story, and
authority boundaries before readers move into the full spec.

Use [site/navigation.md](site/navigation.md) for role-based paths:

- New to HACP
- Enterprise/governance
- Implementing
- Reviewing protocol
- Validating examples

Use [site/faq.md](site/faq.md) for public objection handling, including:

- "We already have PR reviews and CI"
- "We do not want another agent platform"
- "We need auditability, not more chat"
- "We cannot let agents approve work"

## Public Spec Draft

Use [spec/README.md](spec/README.md) as the public-facing HACP spec draft. It
explains the artifact model, authority boundaries, stop semantics, loop policy,
and validation story.

## Adoption Primer

Use [adoption-primer.md](adoption-primer.md) for a concise, public-facing
enterprise explainer covering HACP scope boundaries, governance language, and
ecosystem mapping across GitHub, Azure DevOps, agent CLIs, and CI/CD policy
surfaces.

## Implementer Quickstart

Use [quickstart.md](quickstart.md) for the smallest useful local loop using the
draft schema examples and expected exit-code behavior.

## Authority Boundary Reminder

HACP is not an agent runtime.
HACP is not a transport protocol.
HACP is not a replacement for human approval.
HACP does not execute work, dispatch packets, call models, write GitHub, merge,
deploy, ship, or accept risk.
Validation output is evidence for review, not approval.

## Reference Example

Use [examples/minimal-v0.1/README.md](examples/minimal-v0.1/README.md) for a
small end-to-end fixture: one approved packet, one returned report, one review
finding, and one JSON Lines audit export. It is intentionally tiny, so protocol
reviewers can test the RFC contracts without inheriting an implementation's
non-public evidence tree.

## Diagrams

Use [diagrams.md](diagrams.md) for non-normative visual aids covering the
minimal lifecycle, authority boundary, base decision matrix, and core record
relationships. The decision-matrix diagram is generated from
[decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml) with
[scripts/generate_decision_matrix_mermaid.py](scripts/generate_decision_matrix_mermaid.py).

## Integration Sketches

Use [examples/integrations/pyrapide/README.md](examples/integrations/pyrapide/README.md)
for a non-normative sketch of how HACP audit events could map into a
PyRapide-style causal event graph for invariant checking.

## Contributing

HACP is still pre-standardisation work. The most useful contributions are:

- protocol-risk findings ordered by severity;
- contradictions between RFCs, schemas, examples, and the decision matrix;
- evidence that a contract is not independently implementable;
- small interoperability fixtures or schema-validation cases.

Use [review-packet.md](review-packet.md) for a focused v0.1 review prompt,
[docs/review-packet.md](docs/review-packet.md) for a focused v0.2 review prompt,
and see [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations.

## License

See [LICENSE.md](LICENSE.md). The draft prose is offered under CC BY 4.0, and
machine-readable artefacts, examples, and validation fixtures are offered under
Apache-2.0 unless a file states otherwise.

## Machine-Readable Draft Artefacts

v0.1 artefacts:

- [profiles/hacp-base-draft-v0.1.yaml](profiles/hacp-base-draft-v0.1.yaml):
  base profile declaration, authority mappings, and forbidden-effect
  declarations.
- [decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml): base Human
  Decision Gate status-transition matrix.
- [schemas/README.md](schemas/README.md): draft schema pack index and
  limitations.
- [schemas/task-packet.schema.json](schemas/task-packet.schema.json)
- [schemas/agent-report.schema.json](schemas/agent-report.schema.json)
- [schemas/human-decision.schema.json](schemas/human-decision.schema.json)
- [schemas/evidence-set.schema.json](schemas/evidence-set.schema.json)
- [schemas/stop-response.schema.json](schemas/stop-response.schema.json)
- [schemas/review-finding.schema.json](schemas/review-finding.schema.json)
- [schemas/loop-policy.schema.json](schemas/loop-policy.schema.json)
- [schemas/examples/manifest.json](schemas/examples/manifest.json)
- [schemas/examples/valid/](schemas/examples/valid/)
- [schemas/examples/invalid/](schemas/examples/invalid/)

v0.2 artefacts:

- [profiles/hacp-base-draft-v0.2.yaml](profiles/hacp-base-draft-v0.2.yaml):
  base registry for record kinds, profiles, digest domains, report shapes, and
  decisions.
- [schemas/common-defs.schema.json](schemas/common-defs.schema.json): shared
  v0.2 digest and decision-rule reference definitions.
- [schemas/authority-packet.schema.json](schemas/authority-packet.schema.json)
- [schemas/handoff-package.schema.json](schemas/handoff-package.schema.json)
- [schemas/adapter-report.schema.json](schemas/adapter-report.schema.json)
- [schemas/match-proof.schema.json](schemas/match-proof.schema.json)
- [schemas/human-decision-record.schema.json](schemas/human-decision-record.schema.json)
- [fixtures/happy-path/](fixtures/happy-path/)
- [fixtures/risk-cases/](fixtures/risk-cases/)

## Canonical Vocabulary Sources

The draft prose explains the contracts, but machine-readable vocabulary should
come from the companion artefacts:

- profile, record-kind, authority, impact, evidence-visibility, actor, finding,
  and profile-status vocabularies come from
  [profiles/hacp-base-draft-v0.1.yaml](profiles/hacp-base-draft-v0.1.yaml);
- status and decision-transition vocabularies come from
  [decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml);
- HACP 0.2 profile, record-kind, digest-domain, requested-report-shape,
  review-condition, and decision vocabularies come from
  [profiles/hacp-base-draft-v0.2.yaml](profiles/hacp-base-draft-v0.2.yaml);
- structural packet/report validation starts from
  [schemas/](schemas/).

If prose, examples, schemas, profile declarations, or the decision matrix
disagree, treat that as a draft defect and report it.
