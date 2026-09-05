# Local Owner Continuation Profile Candidate

Status: candidate contract for a bounded model-free implementation and proof.
Not a released profile, base conformance claim, or execution authority.

## Identity And Scope

- Candidate identity: `org.hacp.local-owner-continuation`, version `0.1-candidate`.
- Profile status: `active`, only for explicit owner-approved candidate
  processing under this declaration. This status does not mean released,
  conformant, implemented, deployed or generally enabled.
- Publisher: HACP maintainers; deployment issuer: explicitly configured owner.
- Base: `hacp-base-draft / v0.1-draft`, unchanged closed base records.
- Discovery: this document and its adjacent fixture inventory, pinned by Git
  commit and SHA-256 before processing. Unknown identity/version fails closed.
- Discovery is by bundled artifact plus the integrity pin above; no registry
  entry or stable release URL is published. A consuming implementation must
  explicitly select this active candidate under owner approval; a filename,
  hash, status or successful validation is not that approval.

This section is the RFC-0009 profile declaration. It adds the five record kinds
and fields defined below, but no base authority or decision vocabulary. Its
authority impact is limited to testing an already-valid human `start_work`
decision through the fixed local observation. It removes optional recovery and
all action choice, confirms the forbidden effects in this document, adds the
44 observations in the adjacent inventory, and uses the compatibility and
migration rules below. Consumers MUST read this declaration before processing
candidate records and reject a missing, changed, deprecated or revoked pin.

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

The referenced base Human Decision Gate MUST pass the closed v0.1 schema and
published decision-matrix checks. For this candidate it MUST be a distinct
human `start_work` act for the same packet, validated as `approved` to
`in_progress`, with `actor_kind: human`, a trusted actor verification source,
and evidence that identifies this exact candidate decision and canonical
action. The verifier resolves that evidence through its owner-controlled local
store; a caller-supplied reference, authenticated service request, unrelated
`approve_next_packet`, automated event, cancellation, closeout or reused human
act is not applicable authority. The dry-run observation does not create or
change base lifecycle status. It only tests whether an already-valid base
`start_work` decision and this extension remain admissible.

The only action is the exact JSON value
`{"operationId":"observe_fixed_payload","parameters":{"payload":"HACP_LOCAL_OWNER_CONTINUATION_PROBE_V1"}}`.
No additional operation, parameter or value is allowed. The implementation may
only compare and synchronously return that fixed payload; it may not interpret
it as a command, provider, network endpoint or code callback. The effect is a
bounded local test observation, not an external side effect or a report
claiming real work completed.

All new profile records use full SHA-256 digests, domain separation, and RFC
8785 JCS. The exact hash input is the UTF-8 encoding, with no BOM or trailing
newline, of this envelope:

```json
{"domain":"<profile-id>.<record-kind>.0.1-candidate","record":<complete-record-with-top-level-digest-omitted>}
```

The `domain` member is therefore inside the hashed preimage. Referenced record
digests remain inside `record`. A digest declaration, stored outside the hash
input it describes, is `algorithm: sha256`, `canonicalization:
json-rfc8785-jcs`, the same versioned `domain`, and a 64-character lowercase
hex `value`. Required record kinds are `decision`, `claim`, `status-event`,
`start-intent`, and `start-result`; every record contains `recordKind`,
`profileId`, and `profileVersion`. Unknown domain/version or any mismatched
binding denies start.

This small known-answer vector fixes envelope interpretation; it is a digest
algorithm check, not a complete decision fixture:

```json
{"domain":"org.hacp.local-owner-continuation.decision.0.1-candidate","record":{"decisionId":"decision-example-001","issuerId":"issuer-example","profileId":"org.hacp.local-owner-continuation","profileVersion":"0.1-candidate","recordKind":"decision"}}
```

Its SHA-256 is
`9de745ae777609863f309450a0455da5ad7a1d166f8f29734d8a2d35d569f014`.
The closed v0.1 Human Decision Gate does not declare a native digest. This
candidate therefore binds it through a detached companion digest declaration
inside the candidate decision; it does not add a field to or claim a digest for
the base record itself. The companion hash input is UTF-8 RFC 8785 JCS of:

```json
{"domain":"org.hacp.local-owner-continuation.base-decision-reference.0.1-candidate","record":<complete-unchanged-closed-base-human-decision-record>}
```

`baseDecisionDigest` is the corresponding digest declaration with `algorithm:
sha256`, `canonicalization: json-rfc8785-jcs`, that exact `domain`, and the full
lowercase hex `value`. The verifier first validates the unchanged base record
against its closed schema and matrix, then verifies this detached candidate
binding. An implementation must not reinterpret this companion digest as a
native base-record digest or mutate the base record to carry it.

The minimal candidate record contracts are closed: unknown members fail. Common
members on all five are `recordKind`, `profileId`, `profileVersion`, `issuerId`,
`decisionId`, and `digest`. In addition:

| Kind | Additional required members |
| --- | --- |
| `decision` | `humanEventRef`, `baseDecisionRef`, `baseDecisionDigest`, `requestRef`, `action`, `approvedAt`, `expiresAt` |
| `claim` | `decisionDigest`, `claimId`, `attemptKey`, `successorId`, `requestRef`, `action`, `claimedAt`, `expiresAt` |
| `status-event` | `eventId`, `targetKind`, `targetDigest`, `sequence`, `previousDigest`, `state`, `recordedAt`, `actorId` |
| `start-intent` | `claimDigest`, `intentId`, `successorId`, `action`, `admittedAt`, `decisionStatusHead`, `claimStatusHead`, `clockSample`, `expiryDeadlineMonotonicNanoseconds` |
| `start-result` | `intentDigest`, `resultId`, `outcome`, `observedAt`, `observationClockSample`, `observationDigest` |

`outcome` is exactly `completed` or `uncertain`; absence is not an outcome.
`clockSample` and `observationClockSample` are closed JSON objects with exactly
`wallTime` and `monotonicNanoseconds`. `wallTime` uses the timestamp format below.
`monotonicNanoseconds` is a non-negative base-10 integer encoded as the JSON
string `"0"` or a string matching `[1-9][0-9]*`, with no sign, leading zero,
fraction or exponent; implementations compare it as arbitrary-precision
nanoseconds from one process-local monotonic clock. Neither sample is supplied
by the caller. `admittedAt` equals `clockSample.wallTime`; `observedAt` equals
`observationClockSample.wallTime`. IDs and references are non-empty strings;
sequence is a non-negative integer; digest members use the declaration above. The
implementation proof MUST publish executable schemas matching this table
before claiming candidate support.

`expiryDeadlineMonotonicNanoseconds` uses the same canonical decimal-string
representation. After the acquisition sample passes `wallTime < expiresAt`,
for both records, `effectiveExpiresAt` is the earlier of decision and claim
expiry. The verifier derives the deadline as acquisition
`monotonicNanoseconds` plus the exact non-negative difference from acquisition
`wallTime` to `effectiveExpiresAt`, converted from milliseconds to nanoseconds.
The derived value is recorded in the start intent; callers cannot supply it.

For `completed`, `observationDigest` is a digest declaration for UTF-8 RFC 8785
JCS of this exact observation envelope:

```json
{"domain":"org.hacp.local-owner-continuation.observation.0.1-candidate","record":{"operationId":"observe_fixed_payload","payload":"HACP_LOCAL_OWNER_CONTINUATION_PROBE_V1"}}
```

Its SHA-256 is
`2291610e38245f88bac99efc480897600b1f322a4004d0113487033a3b13de5e`.
For `uncertain`, `observationDigest` is JSON null: no observation is asserted
or hashed. Any other observation member, domain, payload or digest shape fails.
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

Each decision and claim is created with an initial `active` status event in the
same serialized mutation that records it. A status event contains `eventId`,
`targetKind` (`decision` or `claim`), `targetDigest`, strictly increasing
`sequence`, `previousDigest` (null only at sequence 0), `state` (`active` or
`revoked`), `recordedAt`, configured issuer/actor bindings, and its own digest.
The datastore retains an authoritative head digest for each target and changes
that head atomically with the append. Verification walks sequence 0 through the
head, checks every predecessor/digest/target binding, rejects gaps, forks,
truncation, multiple heads or a head not matching the stored authoritative
head, and derives current state only from the verified final event.

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
already made, and cannot authorize further work. The accepted clock is an
owner-configured local UTC wall clock paired with a monotonic process clock.
The verifier stores the latest accepted wall-clock sample in the authoritative
store. Within the uninterrupted guarded call it samples both clocks after
acquiring the guard and again immediately before observation; wall and
monotonic samples MUST NOT move backward, and the wall sample MUST NOT precede
the durable prior wall sample. The initial post-lock expiry check uses the
acquisition `clockSample`; the immediate pre-observation expiry recheck uses the
later `observationClockSample`. The second check denies observation when either
its `wallTime >= effectiveExpiresAt` or its `monotonicNanoseconds >=
expiryDeadlineMonotonicNanoseconds`; equality denies and there is no grace
period. This monotonic deadline makes elapsed time authoritative if wall time
stalls while the guard is held. Unavailable clocks, invalid samples, rollback,
inability to read/update the durable sample, or inability to keep the same
guarded process interval makes freshness unknown and blocks. No caller-controlled
clock override exists outside explicit test injection, and restart never
resumes an existing intent.

Process interruption, lost response, existing start intent, unknown outcome,
restarted process (including restart after claim but before intent) or any
recovery request routes to human inspection. No
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
The initial independent findings and their bounded repair disposition are in
[the review synthesis](local-owner-profile-review-synthesis.md).
