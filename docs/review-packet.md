# HACP 0.2 Review Packet

Use this packet to review the HACP 0.2 draft for protocol risk.

## Context

HACP 0.2 is a chain-of-custody protocol draft for human-authorized agent work.
It adds handoff packages, match proofs, human decision records, digest domains,
and profile separation to the v0.1 task/report/decision-gate foundation.

Core invariant:

> HACP records may carry authority and evidence, but only explicit human
> decisions approve consequential next steps.

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

## Severity-Ordered Review Questions

### 1. Human Authority Boundaries

- Does any record imply approval without a human decision record?
- Is `requestedNextStep` clearly advisory only?
- Are boundary breach, stale handoff, and matrix drift routed to human review?

### 2. Match Proof Exactness

- Can a match proof link a report to exactly one authorized chain?
- Are required digests and record references sufficient?
- Is the match-proof creator/owner-side verifier role clear enough?
- Are stale or mismatched reports distinguishable from valid reports?

### 3. Digest Domain Correctness

- Are digest domains explicit enough?
- Is the relationship between canonicalization and digest domains clear?
- Could consumers accidentally compare structured and free-text report digests?
- Do fixtures make placeholder digests obvious?

### 4. Human Decision Semantics

- Are decision records clear, idempotent, and reviewable?
- Do decision records avoid raw sensitive report body data?
- Are reasons and confirmations represented without becoming execution commands?

### 5. Transport vs Execution Profiles

- Are transport and execution separated cleanly?
- Does any transport profile imply execution?
- Are execution-capable profiles explicitly human-approved?
- Is the v0.2 profile registry sufficient for a first independent
  implementation?

### 6. Security and No-Execution Boundary

- Does the draft accidentally define a tool runtime, model API, shell, watcher,
  or outbound transport?
- Are sensitive-data and fail-closed boundaries clear?

### 7. Schema and Fixture Clarity

- Are schemas internally consistent with prose?
- Are fixtures coherent and protocol-neutral?
- Are placeholder digests clearly marked as placeholders?

### 8. Standalone Protocol Suitability

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
```
