# WITS v0 Accountable Continuation Source Packet

Status: HACP v0.3 candidate source packet.

Source material:

- [WITS v0 HACP source packet](../wits-v0-hacp-source-packet.md);
- public HACP 0.2 chain-of-custody draft records;
- read-only who-decides spike record at commit `af8dbd7`;
- issue follow-ups for fixtures, multi-human policy, and version inventory:
  [#9](https://github.com/joefeser/hacp/issues/9),
  [#10](https://github.com/joefeser/hacp/issues/10), and
  [#11](https://github.com/joefeser/hacp/issues/11).

This packet translates WITS-proven accountable continuation concepts into
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
6. a stop response is returned when the continuation boundary cannot be proven.

The supported artifact set for demos and examples is:

- task packet;
- review finding;
- human decision;
- consumption receipt;
- agent or adapter report;
- stop response when continuation stops instead of running.

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
- the decision-request or stop-response identifier and digest that asked for
  the decision;
- the digest domain and canonicalization basis used for comparison;
- the permitted successor scope;
- the successor invocation id or claim id;
- the claimant identity or stable role label;
- trusted or profile-defined claim time;
- expiry and revocation ordering rules;
- idempotency and replay handling;
- evidence showing the claim was accepted or rejected.

Accepting a consumption claim proves only that one successor invocation was
admitted under the profile's concurrency rule. It does not prove provider
execution completed, downstream effects happened exactly once, or external
systems avoided duplicated side effects.

## Extension Processing

The current v0.1 and v0.2 base decision schemas are closed. A v0.3 continuation
candidate must not append fields through a profile extension and then claim the
result is still a base decision record.

Use this pattern instead:

- keep the base human decision unchanged;
- publish a separately versioned extension envelope or receipt;
- require extension-aware processing before continuation;
- reject records when required extension data is stripped;
- reject records when the extension profile, version, digest domain, or
  processing rule is unknown;
- preserve a canonical base stop reason when extension processing fails.

Base-only replay of an extension-required continuation must fail closed rather
than treating the old decision as fresh authority.

## Minimal Consumption Candidate

A minimum public candidate should prove these behaviors before HACP treats the
receipt as more than source material:

| Behavior | Expected result |
| --- | --- |
| Two concurrent claim attempts target the same decision/scope | Exactly one claim is accepted; the loser returns a stop response or rejection receipt. |
| Restart after decision before successor invocation | The accepted claim remains durable and can be read back. |
| Claim before human decision exists | Claim is rejected with `MISSING_AUTHORITY`. |
| Ambiguous execution after accepted claim | System records admitted claim but does not claim provider completion. |
| Expired or revoked decision | Claim is rejected; revocation/expiry ordering is visible in evidence. |

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
| Decision or receipt expired, revoked, or superseded | `STALE_PACKET` |
| Claim ordering cannot be proven after restart | `UNVERIFIED_ASSUMPTION` |
| Runtime cannot persist/read admission evidence | `ENVIRONMENT_BLOCKED` |
| Continuing would rely on stale or partial readback | `RELIABILITY_LIMIT_REACHED` |
| A human must resolve residual risk or ambiguous authority | `HUMAN_DECISION_REQUIRED` |

Profile-specific stop codes may add detail, but any base HACP stop response
must preserve the canonical reason and the minimal correction needed to unblock
review.

## CLI And HTTP Report Return

CLI and HTTP return paths should treat a consumption receipt as evidence that a
specific decision was claimed, not as proof that execution completed.

A report-return path should preserve:

- packet or handoff reference;
- decision reference and digest prefix or full digest as appropriate;
- consumption receipt id and digest;
- decision-request or finding reference and digest when it controlled the
  continuation boundary;
- successor invocation id;
- attempted work summary;
- evidence refs and check output;
- residual risk;
- requested next human decision;
- boundary statement that return/import is evidence only.

CLI and HTTP importers should reject reports that claim completion, merge,
deployment, billing, customer runtime, worker launch, or GitHub mutation
authority without a separate human-approved decision/profile that explicitly
covers that effect.

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

Public-safe candidate sketches live in
[examples/](examples/). They are not schema-valid conformance fixtures yet and
use placeholder ids/digests.

| Sketch | Purpose |
| --- | --- |
| [task-packet.candidate.json](examples/task-packet.candidate.json) | Bounded source context and forbidden effects. |
| [review-finding.candidate.json](examples/review-finding.candidate.json) | Finding that requests a human decision before continuation. |
| [human-decision.candidate.json](examples/human-decision.candidate.json) | Closed base-style human decision that stays immutable. |
| [consumption-receipt.candidate.json](examples/consumption-receipt.candidate.json) | Separate one-successor admission receipt. |
| [agent-report.candidate.json](examples/agent-report.candidate.json) | Evidence return tied to the receipt. |
| [stop-response.candidate.json](examples/stop-response.candidate.json) | Fail-closed response when continuation cannot be proven. |

## Conformance Fixture Candidates

Future conformance work should promote the candidate sketches only after the
semantics are proven and digest domains are made deterministic.

Positive candidates:

- one accepted claim out of two concurrent claim attempts;
- restart readback preserves a previously accepted receipt;
- successor report references the accepted receipt and unchanged decision;
- base-only consumer rejects extension-required continuation;
- expired decision produces a canonical `STALE_PACKET` stop response.

Negative candidates:

- two accepted receipts for the same decision/scope;
- consumption fields added directly to a closed base decision record;
- report claims provider exactly-once execution from receipt admission alone;
- stripped extension data treated as base authority;
- queue ack treated as approval, completion, or worker launch authority.

Issue [#9](https://github.com/joefeser/hacp/issues/9) remains the proper home
for real RFC 8785 JCS digest fixture promotion.

## External Proof Gate

The who-decides spike at `af8dbd7` records the public design intent for
consumption receipts, extension processing, and the five-artifact demo set. It
does not, by itself, complete the HACP v0.3 proof gate.

Before this source packet is promoted beyond draft, maintainers should require
independent readback of pinned code, tests, and receipts showing:

- concurrent claim attempts admit exactly one successor;
- restart preserves claim/decision evidence;
- claim-before-start or claim-before-decision fails closed;
- ambiguous execution is reported without pretending completion;
- expiry and revocation ordering is deterministic and reviewable.

Until that evidence is accepted by the owner, a clean docs review or ACK
mechanical result is not a merge or release recommendation for v0.3 semantics.

## Related Backlog

This packet intentionally does not close:

- issue [#9](https://github.com/joefeser/hacp/issues/9), which should add real
  JCS digest conformance fixtures;
- issue [#10](https://github.com/joefeser/hacp/issues/10), which should explore
  multi-human policy without making multi-human approval a generic prerequisite;
- issue [#11](https://github.com/joefeser/hacp/issues/11), which should add the
  reader-friendly v0.1 to v0.2 catch-up guide.
