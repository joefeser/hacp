# HACP #51 — Branch-Separated Candidate Conformance Proposal

Status: **review proposal only**. No schema, fixture, generator, or maturity
change is authorized by this document.

## Pinned evidence

- HACP `main`: `1b94a3a41f0950926e39a74e5045f11ce65c4f1e`
- HACP issue: https://github.com/joefeser/hacp/issues/51
- WITS review target that exposed the conflict:
  `5dd7debb8723df018a7cb06265b8447a934ef1e1`
- WITS typed-stop record:
  `2506b289744b3579836fd944ad60a9fad2c6c093`

## Problem

The current conformance harness treats all seven expected-valid records as one
semantic chain. The stop response and successful agent report bind the same
decision and successor invocation. The report carries immutable work-start
evidence, while the stop schema requires `successorWorkBegan: false`.

Those are alternative terminal outcomes, not simultaneous facts about one
invocation. An independent producer must not invent `false` after work began
merely to satisfy a fixture inventory.

## Proposed ruling

Adopt branch-separated semantic conformance without changing any of the seven
record schemas or digest domains:

1. `successful_continuation` contains task packet, review finding, approving
   human decision, consumption receipt, continuation context, and agent report.
2. `pre_start_stop` contains the task packet and a stop response for a distinct
   decision-attempt identity and distinct never-started successor invocation.
3. The union of the two branches covers all seven candidate record kinds. No
   claim is made that all seven form one chain.
4. Each record remains individually schema-valid and digest-valid.
5. Cross-record semantic validation runs separately for each declared branch.
6. A combined set that asserts a stop and start/report for the same invocation
   fails with `STOP_AFTER_WORK`.

The stop response's `decisionId` identifies the bounded decision attempt whose
continuation stopped; it does not assert that an approving human-decision record
exists. The existing dependency rule—stop response requires only its task
packet—remains unchanged.

## Manifest compatibility

Version the conformance manifest identifier from
`hacp.v0_3_candidate.conformance_manifest.v1` to `v2` because the executable
semantic grouping changes. Preserve `expectedValid` as the seven-record schema
and fixture inventory. Add a closed `expectedValidBundles` array whose entries
name a bundle and list exact fixture paths. Consumers that understand only v1
must fail closed on the unknown manifest identifier; the v1 commit remains
available in Git history.

Invalid fixtures validate against their owning branch rather than a synthetic
union:

- stop-response negatives use `pre_start_stop`;
- all other current negatives use `successful_continuation`, with existing
  `omittedRecords` and trusted context applied there.

## Required implementation evidence

- Regeneration changes only the stop fixture identity/digest, manifest, source
  sketch, documentation, generator, and tests required by this ruling.
- Both declared bundles pass schema, digest, and semantic validation.
- The old combined same-invocation set fails with `STOP_AFTER_WORK`.
- A stop fixture spliced to the successful invocation fails.
- All twenty-two existing negative cases retain their expected diagnostic.
- `npm run hacp:v03-candidate` proves committed vectors are byte-reproducible.
- Candidate status, non-final digest-domain status, split licensing, and the
  Option 1 qualification rule remain unchanged.

## Non-claims

This ruling does not finalize v0.3, authorize WITS implementation, alter
authority, prove execution or reading, create exactly-once effects, or satisfy
the second-implementation criterion. It only makes the executable candidate
package honest about mutually exclusive terminal branches.

## Review questions

1. Is branch separation the minimum correction, or does `stop_response` need a
   schema change before an independent producer can emit it honestly?
2. Does manifest v2 preserve enough compatibility and fail-closed behavior?
3. Are the proposed success and stop record memberships semantically complete?
4. Could any consumer still interpret the union as one chain?
5. What P1/P2 issue remains before Joe may approve implementation?
