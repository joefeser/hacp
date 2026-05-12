# HACP 0.2 Security Boundaries

HACP 0.2 is built around explicit authority boundaries.

## Authority Boundary

The authority packet declares what work may be done. Handoff and transport do
not create new authority. An adapter must not infer authority from receiving a
package.

## Report Boundary

Adapter reports are evidence, not approval. They may request a next step, but
the request remains advisory until a human decision record exists.

## Match-Proof Boundary

A match proof links a report to one authorized chain. It does not judge whether
the work should be accepted.

## Human Decision Boundary

Only the human decision record converts reviewed evidence into a recorded
decision. Implementations must reject or route to review when decision evidence
is incomplete, stale, drifted, or boundary-breached.

## Digest-Domain Boundary

Digest equality is meaningful only inside a declared digest domain. Structured
adapter report digests and free-text report digests are not automatically
comparable.

## Transport Boundary

Transport profiles move records. They do not execute work and do not widen
authority.

## Execution Boundary

Execution-capable profiles must be explicit. No-execution is the default HACP
core posture.

## Sensitive Data Boundary

HACP records should contain only the evidence required for review. Profiles
should define redaction rules for credentials, local paths, private addresses,
tokens, and sensitive operator data.

## Fail-Closed Boundary

If a state change requires audit evidence, the audit evidence and state change
must be committed atomically or not at all. Implementations must document how
they enforce this without requiring a specific storage engine.
