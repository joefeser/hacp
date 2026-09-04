# Local Owner Continuation Review Synthesis

Status: bounded candidate review evidence, not release approval.

## Reviewed Pin

- Candidate commit: `f4df7be755569f1c5f4c2ab6925fe0be62cad066`
- Profile SHA-256: `1c358c5d058fade2723cd02e1dbd3bbb7f9134cfb7f3e3988c35051eaaf001b1`
- Fixture inventory SHA-256: `4b954d85cac1ccd2ee9f592672599cac5104a3cac9e3e0aa80da79ebf06a02bb`
- HACP base: `3ada8c8e86dc181df4f954204eaba2b5426f47f2`
- who-decides reference: `99a256dd870b723b38d1b6b287dd4279f8a72fdf`

Two fresh Codex review contexts independently read those exact pins. Neither
received the other review, edited files, called providers, or mutated GitHub.

## Synthesis

Both reviewers found no P1. Both independently found P2 gaps in:

- verification that a human act and closed-base decision authorize this exact
  packet and action;
- deterministic domain-separated digest preimages and record/status contracts;
- explicit negative and concurrency observations for authority and one-shot
  behavior.

One reviewer separately classified the clock acceptance rule as a P2. The other
called clock trust an unresolved implementation obligation rather than a
separate finding. This is a classification difference, not evidence that the
old rule was executable.

Both agreed the bounded architecture is coherent, the guard must span durable
intent through immediate local handoff, issuer plus decision ID is the slot,
legacy collisions must fail closed, and no new owner decision is needed for the
minimal repairs. Neither review established implementation, runtime proof,
external exactly-once effects, profile conformance, release readiness, or human
acceptance.

## Disposition

The follow-up candidate:

- requires a valid base `start_work` human decision for the same packet and
  exact action, and treats the dry-run as observation rather than a lifecycle
  transition;
- fixes the UTF-8 JCS digest envelope and known-answer vector;
- defines a candidate-owned detached digest for the unchanged closed base
  decision, which has no native digest declaration;
- closes the fixed action and minimal record contracts;
- defines initial status, predecessor ordering and authoritative heads;
- defines local wall/monotonic clock checks with no grace period;
- adds distinct authority, expiry, revocation, status-integrity, restart,
  start-race, legacy-race, digest and unsupported-surface observations.

These dispositions preserve the approved policy. Delegation, remote trust,
external dispatch, automatic recovery/reexecution, migration and relaxed clock
acceptance remain unsupported and would require separate owner decisions.

## Residual Risk

The repaired text and inventory are specifications only. Candidate support
still requires a same-pin implementation, executable schemas/fixtures, observed
serialization and crash evidence, independent proof readback, and human proof
acceptance. Two reviews from the same tool family are independent architecture
reviews for this bounded pass; they are not a cross-tool ship gate or release
authority.
