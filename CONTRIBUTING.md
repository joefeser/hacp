# Contributing

HACP is a working draft. Contributions should make the protocol easier to
review, implement, or falsify.

## Useful Contributions

- Protocol-risk findings ordered by severity.
- Contradictions between RFCs, schemas, examples, and the decision matrix.
- Minimal examples that show an implementation ambiguity.
- Schema-validation cases for conforming and non-conforming records.
- Text that narrows authority, transport, audit, or conformance boundaries.

## Review Style

Use [review-packet.md](review-packet.md) for broad protocol review. Findings
should include:

- severity;
- file or section;
- why it matters;
- recommended change.

Prefer correctness, safety, and interoperability issues over wording polish.

## Scope Boundaries

Do not propose adding autonomous `ship`, `accept_risk`, production deployment,
or risk-acceptance authority to the base HACP vocabulary.

Do not treat successful transport, successful report import, or reviewer
agreement as approval. Approval comes from an approved Task Packet and Human
Decision Gate records.

## Draft Status

HACP is not a standard yet. Please avoid unqualified claims such as "HACP
compliant" until the draft has independent implementations and a published
conformance process.
