# HACP 0.2 Review Packet

Use this packet to review the HACP 0.2 draft for protocol risk. Prioritize
authority, custody, evidence, and execution-boundary failures over wording,
formatting, or prose polish.

## Context

HACP 0.2 is a chain-of-custody protocol draft for human-authorized agent work.
It adds handoff packages, match proofs, human decision records, digest domains,
and profile separation to the v0.1 task/report/decision-gate foundation.

Core invariant:

> HACP records may carry authority and evidence, but only explicit human
> decisions approve consequential next steps.

HACP is not an agent runtime. It does not run tools, call models, or execute
work. It defines authority, custody, evidence, and decision records.

## Files To Review

- `README.md`
- `docs/hacp-0.2.md`
- `docs/non-goals.md`
- `docs/profiles.md`
- `docs/security-boundaries.md`
- `profiles/hacp-base-draft-v0.2.yaml`
- `schemas/authority-packet.schema.json`
- `schemas/handoff-package.schema.json`
- `schemas/adapter-report.schema.json`
- `schemas/match-proof.schema.json`
- `schemas/human-decision-record.schema.json`
- `fixtures/happy-path/`
- `fixtures/risk-cases/`

## Fixture Review Instruction

Validate at least one happy-path fixture and one risk-case fixture against the
schemas and confirm the record chain is mechanically understandable without
private context.

Happy-path fixture set: `fixtures/happy-path/` — contains
`authority-packet.json`, `handoff-package.json`, `adapter-report.json`,
`match-proof.json`, and `human-decision-record.json`.

Risk-case fixture set: `fixtures/risk-cases/` — contains stale-handoff,
matrix-drift, boundary-breach, manual-override, and boundary-breach decision
examples. See `fixtures/risk-cases/README.md` for the full list.

Confirm: can a reviewer trace the full chain (authority → handoff → report →
match proof → decision) using only the fixture files and schemas, with no
private implementation context?

## Severity-Ordered Review Questions

### 1. Human Authority Boundaries

- Does any record imply approval without a human decision record?
- Is `requestedNextStep` clearly advisory only?
- Are boundary breach, stale handoff, and matrix drift routed to human review?

### 2. Verifier and Owner-System Trust Boundary

- Does the verifier prove custody only, without becoming a silent approval
  authority?
- Verifier, owner-system, and review-service records may establish match proof
  or custody evidence. They must not accept completion, approve risk, ship,
  merge, or widen authority. Is this boundary clear in the prose and schemas?
- Is the match-proof creator/owner-side verifier role distinct from the
  adapter that produced the report?
- A match proof is evidence of custody linkage, not approval of the report's
  content or requested next step. Is this distinction explicit enough for an
  independent implementer?

### 3. Match Proof Exactness

- Can a match proof link a report to exactly one authorized chain?
- Are required digests and record references sufficient?
- Are stale or mismatched reports distinguishable from valid reports?

### 4. Manual Override Semantics

- Does the manual override language make clear that override may establish or
  repair custody matching only?
- Does a manual override record the actor, reason, timestamp, and the normal
  match path that was overridden?
- Does a manual override create a review condition or audit flag?
- Does the draft make clear that manual override must not approve report
  acceptance, risk acceptance, shipping, merging, or next-step authority?
- Is the distinction between "repairing a custody link" and "approving the
  report's outcome" unambiguous?

### 5. Digest Domain Correctness

- Are digest domains explicit enough?
- Is the relationship between canonicalization and digest domains clear?
- Could consumers accidentally compare structured and free-text report digests?
- Do fixtures make placeholder digests obvious?
- **Never do this** — confirm the draft excludes or warns against each of the
  following misuses:
  - Comparing digest prefixes as proof of identity or custody.
  - Comparing digests across different digest domains.
  - Treating a `legacy_free_text_report` digest as equivalent to a structured
    `adapter_report_v0.2` digest.
  - Treating a displayed 16-character prefix as authorization or custody proof.

### 6. Human Decision Semantics

- Are decision records clear, idempotent, and reviewable?
- Do decision records avoid raw sensitive report body data?
- Are reasons and confirmations represented without becoming execution commands?

### 7. Transport vs Execution Profiles

- Are transport and execution separated cleanly?
- Does any transport profile imply execution?
- Are execution-capable profiles explicitly human-approved?
- Is the v0.2 profile registry sufficient for a first independent
  implementation?

### 8. Runtime and Protocol Framing

- Could a reader mistakenly think HACP runs tools, calls models, or executes
  work?
- Does the draft consistently frame HACP as defining authority, custody,
  evidence, and decision records — not as an agent runtime or execution
  framework?
- Are the non-goals (no tool runtime, no model API, no shell, no outbound
  transport) stated clearly enough that an implementer would not accidentally
  build an execution layer and call it HACP-conformant?

### 9. Security and No-Execution Boundary

- Does the draft accidentally define a tool runtime, model API, shell, watcher,
  or outbound transport?
- Are sensitive-data and fail-closed boundaries clear?

### 10. Schema and Fixture Clarity

- Are schemas internally consistent with prose?
- Are fixtures coherent and protocol-neutral?
- Are placeholder digests clearly marked as placeholders?

### 11. Standalone Protocol Suitability

- Can someone read this without private implementation context?
- Are product-specific implementation details avoided?
- Is the status clearly experimental and not 1.0?

## Expected Output

Return findings ordered by severity:

```text
Critical
- ...

High
- ...

Medium
- ...

Low
- ...

Explicit answers:
- Is HACP 0.2 ready as a public draft?
- What must be fixed before publishing?
- What can wait for 0.3?
- Is the no-execution boundary preserved?
- Is the verifier/owner-system trust boundary clear?
- Is manual override scoped to custody repair only?
- Are digest misuse patterns excluded or warned against?
```
