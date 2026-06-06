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
the work should be accepted. The report-producing adapter should not be the sole
author of the proof for its own report; proof creation belongs to the receiving
owner system, verifier, or review service unless a profile explicitly separates
a trusted verifier role.

## Human Decision Boundary

Only the human decision record converts reviewed evidence into a recorded
decision. Implementations must reject or route to review when decision evidence
is incomplete, stale, drifted, or boundary-breached.

A consequential state change includes accepting work, marking work complete,
canceling work, requesting revision, granting additional authority, or changing
the human review posture. Profiles may add to this set, but they must not narrow
it.

## Digest-Domain Boundary

Digest equality is meaningful only inside a declared digest domain. Structured
adapter report digests and free-text report digests are not automatically
comparable. Unknown digest domains must be rejected or routed to human review
unless an accepted profile declares them.

## Transport Boundary

Transport profiles move records. They do not execute work and do not widen
authority.

## Execution Boundary

Execution-capable profiles must be explicit. No-execution is the default HACP
core posture.

Approved tool profiles describe the reviewed boundary for an owner-controlled
tool path: tool identity, version, command shape, allowed and forbidden
parameters, risky flag approval references, runtime/toolchain expectations,
network/write policy, owner, steward, expiry, evidence references, and profile
digest or equivalent binding proof. The profile is an authority contract, not
permission for HACP or a hosted app to run tools.

Fail-closed preflight means packet/profile/command/parameter/risky flag/runtime
or report-proof mismatch stops before evidence is trusted. The stop returns
diagnostics for a human decision and must not silently widen authority.

Runner report import proof is custody evidence. It can bind a returned report
to the approved packet/profile chain for review, but it does not complete work,
approve risk, merge, mutate external systems, or prove every downstream effect
happened correctly.

## Sensitive Data Boundary

HACP records should contain only the evidence required for review. Profiles
should define redaction rules for credentials, local paths, private addresses,
tokens, and sensitive operator data.

## Fail-Closed Boundary

If a state change requires audit evidence, the audit evidence and state change
must be committed atomically or not at all. Implementations must document how
they enforce this without requiring a specific storage engine.
