# WITS v0 Accountable Continuation Source Packet

Status: HACP v0.3 candidate source packet.

The [local owner profile candidate](local-owner-profile.md) is a separately
pinned, narrow application of the owner's verifier/issuer/start policy. It does
not resolve policy for every possible continuation profile. One exact
who-decides implementation now has a reviewed
[evidence reconciliation](local-owner-profile-evidence-reconciliation.md)
covering all 44 candidate fixtures. That implementation evidence is not owner
acceptance, publication, standardization, or a general conformance claim. The
illustrative examples below remain historical candidate paths. Their computed
forms are covered by the separate executable
[v0.3 candidate conformance package](../../../schemas/v0.3-candidate/README.md),
but they are not interchangeable records for the narrower local-owner profile.

Source material:

- [WITS v0 HACP source packet](../wits-v0-hacp-source-packet.md);
- public HACP 0.2 chain-of-custody draft records;
- read-only who-decides spike record at commit `af8dbd7`;
- issue follow-ups for fixtures, multi-human policy, and version inventory:
  [#9](https://github.com/joefeser/hacp/issues/9),
  [#10](https://github.com/joefeser/hacp/issues/10), and
  [#11](https://github.com/joefeser/hacp/issues/11).

This packet translates WITS-derived accountable continuation concepts into
public-safe HACP draft language. It is source material for protocol review, not
a runtime design, product claim, or conformance release.

## Scope

HACP v0.3 candidate work should describe how a completed human decision can be
consumed by exactly one bounded successor invocation without changing the
decision record itself.

The candidate shape separates these concerns:

1. a task or authority packet states the bounded work and forbidden effects;
2. a review finding or report creates evidence that a human decision is needed;
3. a human decision records the accountable human act;
4. a consumption receipt claims that decision for one successor invocation;
5. the successor returns an agent or adapter report tied to the receipt;
6. a stop response is returned when the continuation boundary cannot be proven;
7. a new human decision on the returned report/evidence is required before
   acceptance or completion, using the selected base decision vocabulary.

The supported artifact set for demos and examples is:

- task packet;
- review finding;
- human decision;
- consumption receipt;
- agent or adapter report;
- stop response when continuation stops instead of running.
- closing human decision on the returned evidence.

These are supported artifacts. They are not mandatory in every HACP run.

## Boundaries

This source packet does not add:

- hosted execution;
- hidden model or tool dispatch;
- GitHub mutation authority;
- billing or customer runtime;
- worker launch authority;
- HACP.io product claims;
- a requirement that WITS is present to use HACP.

WITS is a private/reference implementation. Public HACP consumers should not
need WITS paths, tokens, databases, queues, or product runtime details to
understand or implement the protocol concepts.

## Authority Origin

Humans originate HACP authority. Packets carry, record, or reference bounded
authority after a human act has approved the relevant scope.

Transport, queue delivery, report import, review agreement, and fixture success
do not create authority. A packet without a human-origin approval path is source
context, not active authority.

## Consumption Receipt Candidate

A consumption receipt is a separate immutable record that binds one human
decision to one successor invocation. It is not a field appended to a closed
human decision schema, and it does not mutate the approved decision.

A receipt should bind:

- the unchanged human decision identifier and digest;
- verified human-origin evidence for that decision: verification source,
  authentication context, and an attestation/evidence reference;
- the decision-request or stop-response identifier and digest that asked for
  the decision;
- the digest domain and canonicalization basis used for comparison;
- the permitted successor scope, equal to or a subset of the decision's
  approved scope under the approved profile's declared scope grammar;
- the required successor invocation id; a claim id may additionally identify
  the admission attempt but must not replace the invocation binding;
- the claimant identity or stable role label;
- the admitting role and issuer-side admission evidence, independently
  authenticated under the human-approved profile, not a claimant's own
  `admissionResult` assertion;
- trusted or profile-defined claim time;
- expiry and revocation ordering rules;
- idempotency and replay handling;
- evidence showing the claim was accepted or rejected.

Admission verification is a role distinct from merely submitting a claim. The
owner-approved profile must identify the admissible issuer and trust anchor;
these sketches do not select a real authority. An issuer label or matching
digest alone is not authentication. Verify the human-origin evidence and the
scope subset before admission and again when verifying returned evidence.
Missing authority fails with `MISSING_AUTHORITY`; widening scope fails with
`SCOPE_CONFLICT`. Free-text scope labels are illustrative, not a scope grammar.

The profile must publish a deterministic single-consumer uniqueness tuple,
canonical scope representation if scope participates, and atomic admission and
replay rules. Changing an attempt id, idempotency key, scope spelling/order, or
successor invocation id must not create another consumption slot for the same
approved continuation. Exact retries read back the same receipt; conflicting
replay fails closed. A receipt replay cannot authorize a second start after
execution has begun or become ambiguous. The tuple is an unresolved profile
choice, not defined by the example's opaque idempotency key. No implementation
may claim this invariant until that choice and its concurrent tests exist.

Digest objects use `sha256` and the [HACP 0.2 canonicalization rules](../../hacp-0.2.md):
omit a record's own top-level `digest` when hashing its JCS representation;
retain embedded reference digests, which bind their referenced records in their
own domains. This applies also to the separately referenced start-evidence
record, not to its display copy inside a report. The proposed
`org.hacp.*.v0.3-candidate` domains remain REVIEW-REQUIRED: consumers must
reject them unless an approved profile declares their coverage and
interpretation. The executable package supplies reproducible computed
candidate values without finalizing those domain strings as a standard.

Accepting a consumption claim proves only that one successor invocation was
admitted under the profile's concurrency rule. It does not prove provider
execution completed, downstream effects happened exactly once, or external
systems avoided duplicated side effects.

Claim-before-start means that an accepted claim must be durably recorded and
read back for the successor invocation before that invocation starts work.
The failure case is successor start without durable readback of its accepted
claim; that attempt must fail closed. Claiming before start is the required
ordering, not the condition to reject. Missing accepted-claim readback maps to
`MISSING_AUTHORITY`.

Durable acceptance is not continuing validity. Before successor start, verify
both decision and receipt expiry/revocation against current, authenticated
status evidence ordered with the start gate by the approved profile. A change
between acceptance and start must be observed: expiry or revocation ordered
before start prevents work with `STALE_PACKET`. If this ordering or freshness
cannot be established, do not start; return `UNVERIFIED_ASSUMPTION` (or
`ENVIRONMENT_BLOCKED` if the status source is unavailable).

The immutable receipt's `receiptExpiresAt` describes only that receipt's
validity bound. `decisionValidityRef` identifies separate decision-status
evidence; `receiptValidityRef` identifies separate receipt-status evidence.
Neither is a mutable field on the decision or receipt, and neither may be
trusted just because the claimant supplied its URI. The approved profile must
specify the status issuer, integrity binding to the exact decision/receipt,
decision expiry source, revocation ordering, and freshness/start-gate rule.
An old status snapshot cannot prove that no later revocation exists. These
policy choices remain open and block usable continuation; the sketch does not
invent a status endpoint, authoritative store, or revocation algorithm.

## Extension Processing

The current v0.1 and v0.2 base decision schemas are closed. A v0.3 continuation
candidate must not append fields through a profile extension and then claim the
result is still a base decision record.

Use this pattern instead:

- keep the base human decision unchanged;
- publish a separately versioned extension envelope or receipt;
- bind an extension-required profile/version marker and the base decision and
  required receipt identifiers/digests into an integrity-protected outer
  continuation context;
- require consumers of the continuation path to validate that context against
  their trusted, human-approved profile before interpreting the base decision;
- require extension-aware processing before continuation;
- reject records when required extension data is stripped;
- reject records when the extension profile, version, digest domain, or
  processing rule is unknown;
- preserve a canonical base stop reason when extension processing fails.

Base-only replay of an extension-required continuation must fail closed rather
than treating the old decision as fresh authority.

The outer context is mandatory input for this continuation path, not optional
metadata inferred from the detached receipt. Removing the context must fail the
path's required-input check; removing the marker or changing its bindings must
fail integrity validation. A consumer that cannot process the required profile
must stop. A bare, unchanged base decision cannot reveal a stripped extension by
itself: it may remain valid for unrelated base processing, but is insufficient
authority to enter this continuation path. Profiles must not permit fallback
from a failed continuation-context check into a base-only successor start.

## Minimal Consumption Candidate

A minimum public candidate should prove these behaviors before HACP treats the
receipt as more than source material:

| Behavior | Expected result |
| --- | --- |
| Two concurrent attempts target one approved continuation under the profile's declared uniqueness tuple | Exactly one claim is accepted; changing an attempt key or equivalent scope representation cannot bypass the rule. The loser returns a stop response or rejection receipt. |
| Restart after decision before successor invocation | The accepted claim remains durable and can be read back. |
| Claim before human decision exists | Claim is rejected with `MISSING_AUTHORITY`. |
| Successor attempts to start without durable readback of its accepted claim | `MISSING_AUTHORITY`; no successor work begins. This is the claim-before-start failure test. |
| Ambiguous execution after accepted claim | System records admitted claim but does not claim provider completion. |
| Expired or revoked decision | Claim is rejected; revocation/expiry ordering is visible in evidence. |
| Decision or receipt becomes expired/revoked after acceptance but before start | `STALE_PACKET`; no work begins under the stale claim. Unprovable ordering also prevents start. |

An atomic single-consumer admission rule is narrower than exactly-once provider
execution. Profiles should say that plainly.

## Stop Reasons

Continuation-specific diagnostics should map back to canonical HACP stop
responses. Candidate mappings:

| Continuation condition | Canonical stop reason |
| --- | --- |
| No human decision, digest mismatch, or missing receipt profile | `MISSING_AUTHORITY` |
| Required extension data is absent or stripped | `MISSING_AUTHORITY` |
| Continuation request differs from the approved scope | `SCOPE_CONFLICT` |
| Decision or receipt is expired/revoked according to authenticated current status | `STALE_PACKET` |
| No accepted claim can be read back | `MISSING_AUTHORITY` |
| Accepted claim exists but start ordering or current-status freshness is unproven | `UNVERIFIED_ASSUMPTION` |
| Admission/status evidence source is unavailable | `ENVIRONMENT_BLOCKED` |
| Partial readback prevents reconstruction of broader prior context, beyond the specific cases above | `RELIABILITY_LIMIT_REACHED` |
| A human must resolve residual risk or ambiguous authority | `HUMAN_DECISION_REQUIRED` |

Profile-specific stop codes may add detail, but any base HACP stop response
must preserve the canonical reason and the minimal correction needed to unblock
review.

Candidate decision/disposition labels are explanatory, not new base enum values:

| Candidate label | Base projection |
| --- | --- |
| `approve_bounded_successor` | v0.1 `approve_next_packet` or v0.2 `accept_follow_up`, subject to that version's decision matrix and approval evidence. |
| `review_draft_packet` | Advisory request for `request_human_decision`, not a completed human act. |
| Finding `recommendedDisposition: request_human_decision` | v0.1 finding `classification: needs_human_decision` with `requires_human_decision: true`. |

Base output must use the selected version's actual fields, required evidence,
and permitted transitions; renaming one field does not convert a candidate into
a valid base record. Descriptive forbidden-effect labels in the task sketch
are scope exclusions, not additions to a closed base forbidden-effects enum.

## Loop Ceilings

[RFC-0006](../../../rfcs/0006-loop-ceiling-and-bounded-iteration.md) applies:
declare a visible ceiling or single-pass posture before iterative work. Keep
the base increment trigger (another human-approved packet after a prior return)
unless a named profile explicitly changes it. Imports, queue delivery, and
claim retries do not silently increment or reset the base loop counter.
Reports preserve the loop counter and outcome; a ceiling breach routes to
human decision or terminal stop, never automatic reset, expansion, or bypass.

Profiles must separately bound claim/restart retries with a deterministic
attempt rule and visible limit; a failed or ambiguous attempt cannot create an
unbounded retry path. The owner chooses those bounds. The sketches illustrate
a single-pass session with ceiling/counter zero, one initial claim, and no
automatic retry. This is an example posture, not a default for all consumers.

## CLI And HTTP Report Return

CLI and HTTP return paths should treat a consumption receipt as evidence that a
specific decision was claimed, not as proof that execution completed.

A report-return path should preserve:

- the report's own identifier and full content digest, including its digest
  domain and canonicalization basis;
- packet or handoff reference;
- decision reference and full digest/domain; prefixes are human display only,
  never authorization or integrity evidence;
- consumption receipt id and digest;
- decision-request or finding reference and digest when it controlled the
  continuation boundary;
- successor invocation id;
- authenticated issuer-side admission evidence and a scope-subset comparison
  against the unchanged human decision;
- a digest-bound start-evidence reference tying that invocation and accepted
  receipt to durable claim-readback and work-start timestamps, with the
  profile-defined time source used to establish their order;
- authenticated decision/receipt validity evidence evaluated at the start gate,
  with bindings, freshness, and ordering checked under the approved profile;
- report return time and loop counter/outcome;
- attempted work summary;
- evidence refs and check output;
- residual risk;
- requested next human decision;
- boundary statement that return/import is evidence only.

CLI and HTTP importers should reject reports that claim completion, merge,
deployment, billing, customer runtime, worker launch, or GitHub mutation
authority without a separate human-approved decision/profile that explicitly
covers that effect.

The start-evidence fields illustrate an auditable ordering record, not proof
from self-reported timestamps alone. A verifier must read the referenced
evidence and verify its digest, invocation/receipt bindings, and ordering under
the approved profile. Missing or unverifiable evidence cannot establish
claim-before-start. Current expiry/revocation checks remain independently
required; ordering evidence does not establish current authority.

Inline start-evidence fields are display copies, not an alternative source of
truth. Any disagreement with the verified referenced record fails closed with
`UNVERIFIED_ASSUMPTION`. The referenced start record must bind the separate
validity readback used at start. A report returned after receipt expiry may
still be retained as historical evidence; return time does not re-authorize
work or replace the validity check at start.

Importers must verify the returned report's content digest under the selected
profile before using its contents as evidence. Matching only digests of records
referenced by the report does not protect the report itself. The executable
candidate package computes both the report digest and its referenced record
digests; changing any bound content requires regeneration and revalidation.

## RabbitMQ Transport Envelope Posture

RabbitMQ remains source material for transport-envelope design only.

A RabbitMQ-style transport profile may carry task packets, decision requests,
decision records, consumption receipts, reports, and stop responses. Queue
publish, delivery, claim, ack, retry, and dead-letter events are custody
evidence. They do not approve work, launch workers by themselves, or mark a
decision as consumed unless the profile defines an explicit admission rule and
durable receipt.

Useful envelope evidence includes:

- message id and correlation id;
- payload digest and digest domain;
- producer and consumer role labels;
- delivery, claim, ack, retry, and dead-letter timestamps;
- receipt or stop-response reference;
- expiry and revocation readback;
- boundary assertion that transport success is not approval or completion.

## Example Sketches

Public-safe historical candidate examples live in [examples/](examples/).
Their computed content is preserved, while
[`schemas/v0.3-candidate/fixtures/`](../../../schemas/v0.3-candidate/fixtures/)
supersedes these paths as the executable conformance corpus.

| Sketch | Purpose |
| --- | --- |
| [task-packet.candidate.json](examples/task-packet.candidate.json) | Bounded source context and forbidden effects. |
| [review-finding.candidate.json](examples/review-finding.candidate.json) | Finding that requests a human decision before continuation. |
| [human-decision.candidate.json](examples/human-decision.candidate.json) | Immutable candidate human-decision record, separate from the closed v0.1 base record. |
| [consumption-receipt.candidate.json](examples/consumption-receipt.candidate.json) | Separate issuer-evidenced admission receipt with scope bounded by the decision. |
| [continuation-context.candidate.json](examples/continuation-context.candidate.json) | Required outer input binding the extension marker, decision, receipt, and invocation. |
| [agent-report.candidate.json](examples/agent-report.candidate.json) | Evidence return tied to the receipt. |
| [stop-response.candidate.json](examples/stop-response.candidate.json) | Fail-closed response recording that no successor work began, not that forbidden effects occurred. |

The continuation context is the required input to continuation processing;
the report references its identifier and digest for later audit. The consumer
must validate the context using its independently trusted profile before
interpreting the decision or receipt. No example supplies a trust anchor or
proves current revocation status, and no new base schema is implied.
All `evidence://example/` references are hypothetical, not supplied proof
artifacts. No sketch illustrates the closing human decision yet; that separate
record is still required before marking work complete.

## Candidate Conformance Fixtures

The executable candidate package promotes the seven example shapes into
closed schemas and computed vectors. Its exact digest-domain identifiers and
second-implementation qualification rule remain explicit owner review gates.

Positive candidates:

- one accepted claim out of two concurrent claim attempts;
- restart readback preserves a previously accepted receipt;
- successor report references the accepted receipt and unchanged decision;
- base-only consumer rejects extension-required continuation;
- expired decision produces a canonical `STALE_PACKET` stop response.

Negative candidates:

- two accepted receipts for one continuation under the approved uniqueness tuple,
  including attempts with changed idempotency keys or equivalent scope labels;
- consumption fields added directly to a closed base decision record;
- report claims provider exactly-once execution from receipt admission alone;
- stripped extension data treated as base authority;
- queue ack treated as approval, completion, or worker launch authority.

Issue [#9](https://github.com/joefeser/hacp/issues/9) preserves the historical
RFC 8785 JCS fixture work. The executable corpus records its current bounded
result without claiming protocol release.

## External Proof Gate

The who-decides spike at `af8dbd7` records the public design intent for
consumption receipts, extension processing, and the five-artifact demo set. It
does not, by itself, complete the HACP v0.3 proof gate.

Before this consumption-contract source packet is merged, maintainers must require
independent readback of pinned code, tests, and receipts showing:

- concurrent claim attempts admit exactly one successor;
- restart preserves claim/decision evidence;
- the claim-before-start failure test rejects successor start without durable
  readback of its accepted claim;
- ambiguous execution is reported without pretending completion;
- expiry and revocation ordering is deterministic and reviewable.

The local-owner evidence reconciliation verifies these observations for the
exact who-decides candidate implementation at
`e47515f8b66a318966233fbf416da0b130650ede`. It does not turn this general
source packet into a standard, authorize release or deployment, or substitute
for owner acceptance. A clean docs review or ACK mechanical result remains
insufficient for any of those later decisions.

## Related Backlog

This packet intentionally does not close:

- issue [#9](https://github.com/joefeser/hacp/issues/9), which should add real
  JCS digest conformance fixtures;
- issue [#10](https://github.com/joefeser/hacp/issues/10), which should explore
  multi-human policy without making multi-human approval a generic prerequisite;
- issue [#11](https://github.com/joefeser/hacp/issues/11), which should add the
  reader-friendly v0.1 to v0.2 catch-up guide.
