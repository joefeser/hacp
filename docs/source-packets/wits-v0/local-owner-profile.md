# Local Owner Continuation Profile Candidate

Status: candidate contract for a bounded model-free implementation and proof.
Not a released profile, base conformance claim, or execution authority.

## Identity And Scope

- Candidate identity: `org.hacp.local-owner-continuation`, version `0.1-candidate`.
- Publisher: HACP maintainers; deployment issuer: explicitly configured owner.
- Base: `hacp-base-draft / v0.1-draft`, unchanged closed base records.
- Discovery: this document and its adjacent fixture inventory, pinned by Git
  commit and SHA-256 before processing. Unknown identity/version fails closed.
- No active/revoked profile registry entry is published by this source packet.
  A consuming implementation must explicitly select this candidate under owner
  approval; a filename, hash, or successful validation is not that approval.

The owner approved: an owner-controlled authenticated verifier, one consumption
slot per issuer plus decision ID, and fail-closed expiry/revocation checks
immediately before start. This contract specifies only a local, single-store,
model-free dry-run path. It is not a general policy engine or trust service.

HACP references human authority; it never creates it. Consumption is not
execution completion; transport acceptance is not reading; evidence is not
approval. No hosted execution, model/tool dispatch, GitHub mutation, billing,
worker launch, release, deployment, autonomous ship or risk acceptance is added.

## Supported Surface

The implementation exposes one explicitly named authenticated local verifier
entry point for recording a human decision, admitting a claim, changing current
status, and attempting a model-free guarded start. It may be a local library
API exercised by tests; this packet does not authorize a new HTTP service.
The verifier authenticates the caller before any mutation or start check and
derives the issuer and human actor from owner-controlled configuration, never
from caller-supplied identity labels. A credential authenticates access, not a
human decision by itself: recording approval requires an explicit human act,
scope and evidence. Synthetic credentials/actors in tests must be labeled as
fixtures and cannot be used as actual approval evidence.

An existing unauthenticated console, old consumption API, provider live-loop,
or receipt parser is NOT this entry point. Those paths remain legacy/demo-only
and cannot claim candidate support. No provider path is wired or run by this
packet. Never use a legacy path as fallback after verifier rejection.

The local owner controls the process, datastore and authentication configuration;
compromise by that owner/host is outside this bounded trust model. Invalid,
missing or unrecognized authentication/configuration denies access before
reading protected artifacts or mutating state. No secret material belongs in
decisions, receipts, diagnostics or exported proof. Remote/multi-host identity,
key rotation and delegated approval are unsupported, not guessed defaults.

## Decision And Claim Bindings

The immutable approved decision binds issuer ID, decision ID, profile/version,
authenticated human actor/event reference, base decision reference and full
digest/domain, request reference, exact canonical action, approval time and
explicit expiry. Scope is exact equality for this candidate; subset inference,
natural-language equivalence and multi-action expansion are unsupported.

The action is a JSON object containing a fixed model-free dry-run operation ID
and its declared parameters. Its grammar is closed by the implementation's
pinned adapter and declared in proof; unknown operation/parameter fails closed.
No operation may select a command, provider, network endpoint or code callback
from untrusted input. The effect is a bounded local test observation, not an
external side effect or a report claiming real work completed.

All new profile records use full SHA-256 digests, domain separation, and RFC
8785 JCS over the complete record with its own top-level digest omitted.
Referenced record digests remain in that preimage. A digest declaration is
`algorithm: sha256`, `canonicalization: json-rfc8785-jcs`, a versioned domain,
and full hex value. Domain names are `<profile-id>.<record-kind>.0.1-candidate`.
Required record kinds are decision, claim, status-event, start-intent, and
start-result. Unknown domain/version or any mismatched binding denies start.
Expiry is mandatory on decision and claim, finite RFC3339 UTC with millisecond
precision and a valid calendar date; null/absent, invalid and expired values
fail closed. Receipt expiry cannot exceed decision expiry.

The datastore enforces uniqueness on `(issuerId, decisionId)` atomically.
Digest, request, action, profile version, attempt key and successor ID are
bindings to that slot, not extra dimensions that mint another slot. Changing
any bound content conflicts; changing successor conflicts. Exact claim retry
returns the original receipt without modifying it, extending expiry, starting
work or resetting status. Independently re-read the durable receipt and verify
all bindings; merely returning from INSERT is not sufficient start evidence.
The slot remains consumed after expiry, revocation, failure or uncertainty.

## Current Status And Start Boundary

The owner-controlled verifier is the sole issuer of current status in the same
authoritative local datastore as the slot. Status changes are authenticated,
append-only, digest-bound events for the exact decision/claim. Revocation is
terminal in this candidate: no un-revoke or status reset. Never infer active
status from an absent row, a caller snapshot, a receipt's old accepted flag,
or a self-supplied URI. Both decision and claim must have known active status.

A guarded start requires a fresh authenticated request to this verifier, exact
decision/claim/successor/action bindings, durable receipt readback and an unused
start slot. In one serialized boundary shared with status mutations:

1. Obtain the write/serialization guard, then read current status and time.
   Check expiry AFTER any wait; `now >= expiry` denies start.
2. Verify complete status integrity/order and active state for both records.
   Unknown/missing/tampered status or untrustworthy time denies start.
3. Durably record the one-shot start intent before any invocation attempt.
   Commit of that intent is **start admission**, not evidence work began.
4. Only that uninterrupted call may attempt the fixed local dry-run observation
   at most once. Recheck time immediately before that observation; if expired,
   stop without work. Revocation checks and this handoff must share the same
   serialization guard so a prior committed revocation cannot be overlooked.
5. Record a separate result describing observed completion or uncertainty.
   A missing result never implies success and never permits a second attempt.

The implementation must document how its guard spans durable intent and the
local handoff; database atomicity alone does not make external execution atomic.
If the implementation cannot enforce this local interval, it must deny start,
not rename an earlier snapshot as an immediate-before-start check. Revocation
ordered before the handoff wins; later revocation cannot undo an observation
already made, and cannot authorize further work. The status/clock assumptions
and order must be inspectable in proof. Clock rollback/unknown freshness blocks;
no caller-controlled clock override exists outside explicit test injection.

Process interruption, lost response, existing start intent, unknown outcome,
restarted process or any recovery request routes to human inspection. No
automatic recovery, stale-lock reclaim, retry, receipt reset, new successor,
or exactly-once external-effect promise. Store reopen for historical readback
is supported; resume/reexecution is not. A new human decision is needed for
any separately authorized later work, with the original history preserved.

## Diagnostics And Base Compatibility

These are candidate diagnostics, not new base decision/authority enums:

| Condition | Base stop mapping |
| --- | --- |
| Unauthenticated request, missing decision/claim/profile | MISSING_AUTHORITY |
| Changed scope or unsupported operation | SCOPE_CONFLICT |
| Expired or revoked decision/claim | STALE_PACKET |
| Corrupt bindings/status, unknown order or clock | UNVERIFIED_ASSUMPTION |
| Store/serialization unavailable | ENVIRONMENT_BLOCKED |
| Existing start intent, recovery or ambiguous result | HUMAN_DECISION_REQUIRED |

If multiple conditions apply, authentication is checked first; known
expiry/revocation may deny before other integrity details are disclosed. No
failure may dispatch work. A base stop must still carry all fields required by
its own schema. Auth failures may return a minimal access denial without
disclosing protected record existence. Candidate receipts extend no closed
base schema: use separate required-context records bound to the base decision.
Missing extension context cannot fall back to base-only authority.

RFC-0006 single-pass posture applies: zero additional loop cycles and no
automatic claim/start retry. Exact claim readback is not another execution
cycle. Runtime-identity attestation is preflight evidence under RFC-0008/0009,
not approval. Allowance/reservation evidence is distinct from loop counters
and verified spend; unused capacity creates no authority. Unknown outcomes
remain explicit, never inferred completion.

## Migration And Unsupported Capabilities

who-decides main `99a256dd870b723b38d1b6b287dd4279f8a72fdf` has proven local
consumption integrity under its own `who-decides.decision.v1` encoding. That
encoding is not this JCS/domain profile. Preserve it and its historical proof;
do not silently reinterpret old hashes or mutate existing receipts.

Old receipts without issuer, authenticated approval, complete expiry or current
status are read-only history. They cannot authorize this profile's start. A
new issuer cannot bypass old consumption by reusing an old decision ID: until
an explicit migration is approved, any matching legacy decision ID blocks new
profile admission. Do not guess its issuer, delete its row or reset its slot.
New decisions use fresh IDs and explicit approval; no automated migration or
grant renewal is part of this packet. Changing profile version does not free a
slot. The owner must separately approve future namespace/key migration.

| Capability | Candidate contract | Evidence status at initial pin |
| --- | --- | --- |
| Immutable consumption, conflict detection, expiry under write lock | Preserve existing behavior | Existing who-decides tests/proof; not yet this profile |
| Authenticated issuer+decision slot and exact action | Required | Pending new implementation/proof |
| Current status and guarded start, expiry/revocation race | Required | Pending new implementation/proof |
| Historical readback after restart | Supported | Receipt proof exists; new profile proof pending |
| Recovery/reexecution after interruption | Explicit human-inspection stop | Negative proof required |
| Unauthenticated console or real provider path | Unsupported | No candidate authority/conformance claim |
| Distributed trust, remote execution, billing or release | Unsupported | No implementation or proof claim |

## Proof Gate

The adjacent fixture inventory defines required positive/negative observations.
Capture pinned source/profile/harness hashes, authenticated fixture provenance,
actual process overlap/serialization observations, durable receipt/status/start
records and exact outcomes. Fixtures contain no real credentials; synthetic
owner acts are not Joe's proof acceptance. No test-name, schema pass, review,
transport receipt or merge substitutes for observed behavior or human approval.

Before claiming this candidate implemented, verify actual who-decides evidence
against this same pinned contract. Before material adoption, require two
independent reviewers with identical pins, no priming between them, and an
evidence-based synthesis. Available Codex reviewers can perform the bounded
reviews; no additional paid Kiro permission exists. Release/deployment/merge
are not authorized. Proof acceptance and any release decision remain human.
