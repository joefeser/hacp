# HACP #51 — Branch-Separated Candidate Conformance Proposal

Status: **revised review proposal only**. No schema, fixture, generator, or
maturity change is authorized by this document.

## Pinned evidence

- HACP `main`: `1b94a3a41f0950926e39a74e5045f11ce65c4f1e`
- HACP issue: https://github.com/joefeser/hacp/issues/51
- WITS review target that exposed the conflict:
  `5dd7debb8723df018a7cb06265b8447a934ef1e1`
- WITS typed-stop record:
  `2506b289744b3579836fd944ad60a9fad2c6c093`
- Initial HACP proposal review target:
  `ddfd7110522258351831a891040d543a6c7a036e`

## Problem

The current conformance harness treats all seven expected-valid records as one
semantic chain. The stop response and successful agent report bind the same
decision and successor invocation. The report carries immutable work-start
evidence, while the stop schema requires `successorWorkBegan: false`.

Those are alternative terminal outcomes, not simultaneous facts about one
invocation. An independent producer must not invent `false` after work began
merely to satisfy a fixture inventory.

The initial two-bundle proposal was also incomplete. It left the stop response
bound to no actual human-decision record, could not exercise a later human
decision whose request is the stop response, and described a `STOP_AFTER_WORK`
test that the current validator could never reach for a schema-valid record.

## Proposed ruling

Adopt branch-separated semantic conformance without changing the validation
shape or digest domain of any of the seven candidate record kinds.

### Normative stop identity

Within this candidate profile, `stop_response.decisionId` is the exact identity
of the real human-decision record that authorized the attempted continuation.
It is not a reserved identifier, a proposed future decision, a decision-request
identity, or evidence that the decision was consumed. A later human decision
that responds to the stop has its own distinct `decisionId` and binds the stop
through `decisionRequest.kind: stop_response`.

This definition must appear in the normative candidate package README and as a
validation-neutral `description` on `stop-response.schema.json`. A producer
must not emit a stop response until it can name the actual authorizing decision.

### Declared valid bundles

Manifest v2 declares three closed bundle kinds. Fixture paths, rather than only
record kinds, are authoritative for membership.

1. `successful_continuation` contains one success-branch task packet, review
   finding, approving human decision, accepted consumption receipt,
   continuation context, and agent report.
2. `pre_start_stop` contains one stop-branch task packet, review finding,
   approving human decision, and stop response. Its authorizing decision and
   successor invocation are distinct from the success branch. It contains no
   consumption receipt, continuation context, or agent report.
3. `stop_decision_response` contains the exact stop-branch task packet and stop
   response plus a second human decision whose `decisionRequest` binds that
   stop. The second decision uses a distinct identity and a non-approval
   outcome; it demonstrates the declared stop-to-human-decision composition
   without claiming a successor start.

The package therefore contains more than seven valid fixture files while still
covering exactly seven candidate record kinds. Shared fixture paths between the
second and third bundles are declared explicitly; they are shared antecedents,
not duplicate records or a combined execution chain.

Each bundle is independently schema-, digest-, and semantics-valid. The union
is an inventory only and must never be passed to semantic validation as one
chain.

### Cross-record rule disposition

- Retire the global `STOP_DECISION_MISMATCH` rule. Replace it with a
  `STOP_AUTHORIZING_DECISION_MISMATCH` rule scoped only to a
  `pre_start_stop` bundle. It requires the stop's `decisionId` to equal that
  bundle's single authorizing decision.
- Retire the global `STOP_INVOCATION_MISMATCH` rule. A valid stop branch has no
  accepted receipt to compare. Equality with an invocation from a different
  branch is a collision, not a positive binding rule.
- Re-specify `STOP_AFTER_WORK` as a cross-record conflict: a schema-valid stop
  response and an agent report whose immutable `startEvidence` names the same
  `successorInvocationId` cannot coexist in a candidate semantic bundle or
  explicit cross-bundle negative case. The diagnostic message must state that
  the stop contradicts observed successor work. It must not test whether
  `successorWorkBegan` differs from `false`, because the schema already fixes
  that value.
- Preserve `STOP_PACKET_MISMATCH` within every bundle containing a stop.
- A stop that happens to name the success branch's decision but names a distinct
  never-started invocation is not rejected merely by global identifier
  equality. It is rejected when presented as a member of an undeclared bundle
  or when its branch-local authorizing-decision binding is false. This avoids
  inventing cross-branch authority semantics.

## Manifest v2 contract

Add a closed JSON Schema 2020-12 contract for package metadata at
`schemas/v0.3-candidate/conformance-manifest.schema.json`. This is a schema for
the conformance package, not an eighth protocol record kind. It must:

- require `schema` to equal
  `hacp.v0_3_candidate.conformance_manifest.v2`;
- reject unknown properties at every level;
- describe `expectedValid` as a non-chain fixture inventory;
- declare `expectedValidBundles` with a closed bundle-kind enum and exact
  `recordPaths`;
- reject duplicate bundle identifiers and duplicate record paths within one
  bundle in the loader, where JSON Schema cannot express the complete rule;
- require every valid fixture path to exist, validate, and appear in at least
  one declared bundle;
- require the bundle union to cover all seven protocol record kinds;
- reject undeclared files, unknown paths, unknown bundle kinds, missing
  bundles, and extra or duplicate membership rather than inferring intent;
- require every invalid entry to select exactly one validation input using
  either `baseBundle` plus an exact `replaceRecordPath`, or a complete explicit
  `recordPaths` list for cross-branch cases;
- express omissions as exact `omittedRecordPaths`, not ambiguous record-kind
  names; and
- preserve each invalid entry's exact expected diagnostic code.

`expectedValid` remains useful only as an inventory. The executable harness
must use `expectedValidBundles` as the sole source of positive semantic inputs.
A v1-only consumer and a v2 consumer given a v1 manifest both fail closed on
the exact identifier. Git history preserves v1.

### Provenance fields

Manifest v2 replaces the ambiguous `sourceCommit` field with two explicit
fields:

- `sourcePacketCommit` preserves
  `db47da2118355683f34fd955083c2b3c38769fe4`, the historical source-packet
  provenance; and
- `packageBaseCommit` records
  `1b94a3a41f0950926e39a74e5045f11ce65c4f1e`, the exact parent tree from which
  this regeneration was prepared.

Neither field claims to identify the later commit that contains its own
generated manifest.

## Required negative evidence

The revised package must add committed or test-generated cases that prove:

1. the original all-seven set, with valid digests and the same decision and
   invocation on stop and report, fails with `STOP_AFTER_WORK`;
2. changing and rehashing the stop's invocation to the successful invocation
   fails with `STOP_AFTER_WORK`;
3. changing the stop's decision to the success decision while retaining a
   distinct invocation fails branch membership or
   `STOP_AUTHORIZING_DECISION_MISMATCH`, never a retired global equality rule;
4. inserting a stop into `successful_continuation` fails closed as undeclared
   membership, and also produces `STOP_AFTER_WORK` when the report names the
   same invocation;
5. inserting a receipt, continuation context, or report for the stopped
   invocation into `pre_start_stop` fails closed as undeclared membership; a
   same-invocation report also produces `STOP_AFTER_WORK`;
6. omitting the stop branch's task packet fails with
   `MISSING_REQUIRED_RECORD`;
7. the existing stop packet splice still fails with `STOP_PACKET_MISMATCH`;
8. a `stop_decision_response` decision that reuses the authorizing decision
   identity fails, while a distinct non-approval decision binding the exact
   stop passes;
9. an unknown manifest field, wrong manifest identifier, unknown path,
   duplicate path, duplicate bundle, missing bundle, uncovered valid fixture,
   or unknown bundle kind fails before corpus validation;
10. every invalid fixture selects its validation input unambiguously;
11. `consumption-receipt.divergent-request` remains an intentional in-branch
    decision-request-chain mutation rather than degrading into an unknown
    cross-branch reference; and
12. all twenty-two existing negatives retain their expected diagnostic under
    their declared validation input.

## Required implementation evidence

- Regeneration enumerates every changed generated artifact, including
  `stop-response.valid.json`, `stop-response.candidate.json`,
  `stop-response.spliced-packet.invalid.json`, and
  `consumption-receipt.divergent-request.invalid.json` when their embedded
  identities or digests change.
- All three declared bundles pass schema, digest, and scoped semantic
  validation.
- The manifest validates against its own closed schema before any fixture is
  trusted.
- All existing tests that flatten the seven-record set are converted to
  bundle-scoped tests; no helper may reconstruct the retired union implicitly.
- The required negative evidence above passes with exact diagnostics.
- `npm run hacp:v03-candidate` proves committed vectors are byte-reproducible.
- Candidate status, non-final digest-domain status, split licensing, and the
  Option 1 qualification rule remain unchanged.

## Non-claims

This ruling does not finalize v0.3, authorize WITS implementation, alter
authority, prove execution or reading, create exactly-once effects, or satisfy
the second-implementation criterion. It only makes the executable candidate
package honest about mutually exclusive terminal branches.

## Owner synthesis requested

The two initial independent reviews agree that branch separation is the
smallest safe correction and that no protocol-record schema or digest-domain
change is required. This revision adopts their shared findings and resolves
their main disagreement by requiring the stop to name a real authorizing human
decision and by separately representing a later human response to that stop.

Implementation remains gated on a clean independent review of this revised
proposal and Joe's explicit acceptance of the synthesis.
