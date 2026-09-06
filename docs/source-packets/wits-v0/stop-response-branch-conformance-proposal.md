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

### Normative stop identity and bounded coverage

Within this candidate profile, `stop_response.decisionId` is the identity of
the real human-decision record presented or evaluated as the authority basis
for the attempted continuation. The identifier does not assert that the
decision was authentic, current, unrevoked, sufficient, admitted, or consumed.
It is an identity-only reference because the current stop schema carries no
decision digest; revision-exact stop binding is outside this candidate shape.

It is not a reserved identifier, a proposed future decision, or a
decision-request identity. A later human decision that responds to the stop has
its own distinct `decisionId` and binds the stop through
`decisionRequest.kind: stop_response`.

This definition must appear in the normative candidate package README and as a
validation-neutral `description` on `stop-response.schema.json`. The current
required field can honestly represent only stops where a real decision record
was presented or evaluated. A pre-decision attempt or a stop where no decision
record can be identified is not covered by this candidate stop record, even
though the broader draft maps that condition to `MISSING_AUTHORITY`. That gap
must be recorded for a future version; a producer must not invent a decision ID
to force such a case into v0.3-candidate.

### Declared valid bundles

Manifest v2 declares three closed bundle kinds. Fixture paths, rather than only
record kinds, are authoritative for membership.

1. `successful_continuation` contains exactly the roles `task_packet`,
   `decision_request` (a review finding), `authority_basis_decision`,
   `consumption_receipt`, `continuation_context`, and `agent_report`.
2. `pre_start_stop` contains one stop-branch task packet, review finding,
   authority-basis human decision, and stop response under exactly the roles
   `task_packet`, `decision_request`, `authority_basis_decision`, and
   `stop_response`. Its decision and successor invocation are distinct from
   the success branch. It contains no consumption receipt, continuation
   context, or agent report.
3. `stop_decision_response` contains the exact stop-branch task packet, review
   finding, authority-basis decision, and stop response plus a second human
   decision whose `decisionRequest` binds that stop. Its exact roles are
   `task_packet`, `decision_request`, `authority_basis_decision`,
   `stop_response`, and `response_decision`. The response decision uses a
   distinct identity and a non-approval outcome; it demonstrates the declared
   stop-to-human-decision composition without claiming a successor start.

The package therefore contains more than seven valid fixture files while still
covering exactly seven candidate record kinds. Shared fixture paths between the
second and third bundles are declared explicitly; they are shared antecedents,
not duplicate records or a combined execution chain.

Each bundle is independently schema-, digest-, and semantics-valid. Bundle
entries use explicit semantic roles, so the response bundle resolves the
authorizing decision by `stop.decisionId` and the later response decision by
its distinct identity plus exact stop ID and digest. Zero, multiple, or
ambiguous role matches fail closed. The union is an inventory only and must
never be passed to semantic validation as one chain.

### Cross-record rule disposition

- Retire the global `STOP_DECISION_MISMATCH` rule. Replace it with a
  `STOP_AUTHORITY_BASIS_DECISION_MISMATCH` rule scoped only to a
  `pre_start_stop` bundle. It requires the stop's `decisionId` to equal that
  bundle's single authority-basis decision without asserting that the decision
  was valid or currently authorizing.
- Retire the global `STOP_INVOCATION_MISMATCH` rule. A valid stop branch has no
  accepted receipt to compare. Equality with an invocation from a different
  branch is a collision, not a positive binding rule.
- Re-specify `STOP_AFTER_WORK` as a normative profile-level cross-record
  conflict that every consumer must enforce: a schema-valid stop response and
  an agent report whose digest-bound `startEvidence` assertion names the same
  `successorInvocationId` cannot coexist in a candidate semantic bundle or
  explicit cross-bundle negative case. The diagnostic must state that the
  stop's no-start assertion conflicts with the report's digest-bound start
  assertion; it must not claim that the harness observed or authenticated
  execution. It must not test whether
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
`schemas/v0.3-candidate/package/conformance-manifest.schema.json`. This is a
schema for the conformance package, not an eighth protocol record kind. It is
kept outside the record-schema scan. It must:

- require `schema` to equal
  `hacp.v0_3_candidate.conformance_manifest.v2`;
- reject unknown properties at every level;
- replace v1 `expectedValid` with `fixtureInventory` and require
  `nonChainInventory: true`;
- declare exactly one bundle for each of the three closed bundle kinds in
  `expectedValidBundles`;
- describe each bundle as closed role/path entries, with exact allowed roles
  and cardinalities for that bundle kind;
- reject duplicate bundle identifiers, roles, and paths through schema rules
  where expressible and through the strict loader as a backstop;
- reject multiple records of one kind except the two explicitly distinct human
  decision roles in `stop_decision_response`;
- require every valid fixture path to exist, validate, and appear in at least
  one declared bundle;
- require the bundle union to cover all seven protocol record kinds;
- reject undeclared files, unknown paths, unknown bundle kinds, missing
  bundles, and extra or duplicate membership rather than inferring intent;
- require every invalid entry to select exactly one closed construction form:
  replacement (`baseBundle`, `replaceRecordPath`, invalid `path`), omission
  (`baseBundle`, non-empty `omittedRecordPaths`), or explicit cross-branch
  input (complete role/path entries);
- require replacement targets and omissions to be members of the selected
  base, require replacement record-kind compatibility, apply replacement
  before omission, and reject omissions of absent paths or the replacement
  result;
- reject both/neither selector forms, unknown bases, duplicate explicit paths,
  absolute paths, `..`, non-normalized paths, or any path escaping the fixture
  root before reading fixture contents;
- require exact `expectedCodes` sets with no undeclared diagnostics, rather
  than accepting any incidental matching code; and
- retain the existing trusted `context.revokedDecisionDigests` shape as a
  closed optional context.

The loader's declared-file boundary is recursive `*.json` content beneath
`fixtures/valid/` and `fixtures/invalid/`. It rejects an unlisted JSON fixture
but ignores non-JSON editor or operating-system files. The manifest itself and
the package-metadata schema are outside that inventory.

The executable harness must accept a declared bundle identity, never the raw
`fixtureInventory`, as positive semantic input. Passing the inventory or the
union of bundles is a typed `UNDECLARED_VALIDATION_INPUT` failure. Consumers
MUST reject an unknown manifest identifier before reading either inventories or
bundles. Git history deliberately preserves the non-authorizing v1 package.

### Provenance fields

Manifest v2 replaces the ambiguous `sourceCommit` field with two explicit
fields, and the package README must use the same terms:

- `sourcePacketCommit` preserves
  `db47da2118355683f34fd955083c2b3c38769fe4`, the historical source-packet
  provenance; and
- `regenerationBaseCommit` records the exact HACP commit checked out
  immediately before the authorized executable regeneration begins. It is set
  at implementation time rather than hard-coded by this proposal.

Neither field claims to identify the later commit that contains its own
generated manifest. If the implementation is rebased or any package input
changes, the recorded regeneration base must be recomputed.

## Required negative evidence

The revised package must add committed or test-generated cases that prove:

1. the original all-seven set, with valid digests and the same decision and
   invocation on stop and report, fails with `STOP_AFTER_WORK`;
2. changing and rehashing the stop's invocation to the successful invocation
   fails with `STOP_AFTER_WORK`;
3. changing and rehashing the stop's decision ID inside an otherwise valid
   `pre_start_stop` bundle fails specifically with
   `STOP_AUTHORITY_BASIS_DECISION_MISMATCH`, never a retired global equality
   rule;
4. inserting a stop into `successful_continuation` fails closed as undeclared
   membership, and also produces `STOP_AFTER_WORK` when the report names the
   same invocation;
5. inserting a receipt, continuation context, or report for the stopped
   invocation into `pre_start_stop` fails closed as undeclared membership; a
   same-invocation report also produces `STOP_AFTER_WORK`;
6. omitting the stop branch's task packet fails with
   `MISSING_REQUIRED_RECORD`;
7. the existing stop packet splice still fails with `STOP_PACKET_MISMATCH`;
8. a `stop_decision_response` decision that reuses the authority-basis decision
   identity fails, while a distinct non-approval decision binding the exact
   stop passes;
9. independently rehashed response decisions with either the wrong stop ID or
   wrong stop digest fail with `DECISION_REQUEST_MISMATCH`;
10. a stop response mutated without recomputing its top-level digest fails with
    `DIGEST_MISMATCH`;
11. an unknown manifest field, wrong manifest identifier, unknown base bundle,
   both or neither selector form, replacement path absent from its base,
   wrong-kind replacement, invalid omission, inconsistent inventory
   path/schema pair, unsafe path, unknown path,
   duplicate path, duplicate bundle, missing bundle, uncovered valid fixture,
   duplicate record kind outside the one declared two-decision bundle, or
   unknown bundle kind fails before corpus validation;
12. submitting the complete `fixtureInventory` or the union of all three valid
   bundles as one semantic input fails with the exact expected diagnostic set,
   including `UNDECLARED_VALIDATION_INPUT` and any declared duplicate-role or
   duplicate-kind diagnostics;
13. every invalid fixture selects its validation input unambiguously and every
   cross-branch case matches its complete `expectedCodes` set;
14. `consumption-receipt.divergent-request` remains an intentional in-branch
    decision-request-chain mutation rather than degrading into an unknown
    cross-branch reference; and
15. all twenty-two existing negatives retain their expected diagnostic under
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
- The generator stores valid fixtures by branch/scenario path and processes
  them by role and identity, not by one-record-per-kind object keys. The
  singular historical source-packet example for each kind is selected
  explicitly and documented as an individual example, never dual-written from
  a kind-keyed map or presented as one semantic chain.
- All existing tests that flatten the seven-record set are converted to
  bundle-scoped tests; no helper may reconstruct the retired union implicitly.
- The required negative evidence above passes with exact diagnostics.
- `npm run hacp:v03-candidate` proves committed vectors are byte-reproducible.
- Candidate status, non-final digest-domain status, split licensing, and the
  Option 1 qualification rule remain unchanged.

The package README must also disclose that a stopped
`successorInvocationId` is an assertion made by the stop record, not a positive
binding independently established by an accepted receipt, and that the bare
`decisionId` cannot prove revision-exact authority.

Before #51 closes, the no-decision/pre-decision stop limitation must be recorded
as a named follow-up linked from the package README. That follow-up is not a
reason to invent a sentinel identifier or broaden this candidate correction.

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
