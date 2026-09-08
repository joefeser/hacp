# WITS v0.3 candidate qualification decision packet

Status: Joe accepted the pinned WITS proof as Option 1 evidence and approved
the exact candidate digest domains and bounded candidate publication work on
2026-09-07. WITS Task 1.3f remains open.

## Pinned evidence

| Evidence | Exact ref |
| --- | --- |
| Historical WITS implementation, PR #1367 | `9fa658f7faf2522de6ea12408c784bb987223f00` |
| Historical WITS handoff record, PR #1368 | `5402baf4ba851bf989d7253574af6695e05d02f0` |
| Historical HACP external validator, PR #55 | `b6c6bf35640515045252803cfe49d75e223a12d9` |
| Historical HACP WITS-fixture merge, PR #56 | `5f65c7e439b9b636e1ac7fd6c2d2500762518380` |
| Regenerated HACP candidate package | `6393cd893296c7566059ca95347d82b9454fc2a7` |
| Regenerated WITS producer, PR #1369 | `48bac116b1077a81dc7adf8e34c78cc3da17c7b2` |

PRs [#56](https://github.com/joefeser/hacp/pull/56) and
[WITS #1368](https://github.com/joefeser/what-is-the-spec/pull/1368) preserve
the historical proof and approval context. The corrected domains required a
new HACP package and a new WITS producer commit; those regenerated refs are the
current candidate-publication evidence and do not retroactively change the
refs Joe reviewed for the earlier Option 1 decision.

The regenerated HACP validator accepts all three regenerated WITS bundles and
compares the 22 canonical negative diagnostic sets exactly. The candidate test
suite passes 43/43, including the committed WITS fixture check. HACP PR #68 is
the publication vehicle for those corrected fixtures. WITS PR #1369 preserves
the independently generated source and repin evidence, but its merge is not a
prerequisite for validating the public fixture bytes committed in HACP. The
[receipt](supplementary-validation-receipt.json) and
[reproduction note](supplementary-fixtures.md) identify the regenerated WITS
producer and corrected HACP validator explicitly. Fresh validation reproduced
that corrected receipt exactly; the earlier fixture history remains available
in the merged commits above.

## Decision 1: qualification evidence under #47

Owner status: **approved by Joe Feser on 2026-09-07**, limited to accepting
the pinned WITS proof as Option 1 evidence under #47.

[Issue #47](https://github.com/joefeser/hacp/issues/47) selected independent
production plus cross-validation as Option 1. WITS independently produces its
records through native Product Decision and candidate persistence services;
HACP imports the emitted data and validates it without importing WITS runtime
code. WITS does not import who-decides runtime code. These are evidence for
owner reconciliation of the qualification requirement, not automatic acceptance.

The owner accepted this pinned WITS production and cross-validation result as
Option 1 evidence, retaining all disclosed limits. Acceptance does not establish
full release, distributed exactly-once execution, external-effect proof, or a
finding that all WITS requirements pass. The merged fixture PR itself was not
this decision.

### Owner approval provenance

Source: the active WITS coordination conversation on 2026-09-07, after the
packet was prepared at HACP commit `440df9472df3e736c526629beb3174619187a619`.
Codex asked:

> Do you approve accepting the WITS proof as Option 1 evidence under #47?
> Domain approval, publication, and Task 1.3f would remain open.

Joe replied:

> yes i approve

This return applies to Decision 1 and the four historical evidence refs above. It does
not approve Decision 2, publication, closure of Task 1.3f, or merge of PR #57.

## Decision 2: exact candidate digest domains

Owner status: **approved by Joe Feser on 2026-09-07**.

The published [candidate README](../../../schemas/v0.3-candidate/README.md)
requires Joe's approval of the exact set before candidate publication:

1. `io.hacp.task-packet.v0.3-candidate`
2. `io.hacp.human-decision.v0.3-candidate`
3. `io.hacp.consumption-receipt.v0.3-candidate`
4. `io.hacp.continuation-context.v0.3-candidate`
5. `io.hacp.agent-report.v0.3-candidate`
6. `io.hacp.review-finding.v0.3-candidate`
7. `io.hacp.stop-response.v0.3-candidate`
8. `io.hacp.successor-start-evidence.v0.3-candidate` (supporting record)

The canonical package and the WITS producer were regenerated against this
exact set. A future changed string remains a contract change requiring another
versioned regeneration and owner disposition.

## WITS residual requiring separate disposition

Task 1.3f remains open in the Kiro-governed WITS specification. R4B requires the
final atomic statement's single trusted clock read to supply all admission
timestamp carriers. The implementation instead constructs digest-bearing records
from a prior post-lock database observation, then rechecks time and expiry in
the final atomic CTE. The prior observation does not satisfy the final expiry
predicate. The stronger common-time provenance assertion remains unproven.

Joe accepts this mismatch only as a disclosed v0.3-candidate limitation. That
acceptance does not amend WITS R4B, mark Task 1.3f complete, authorize runtime
execution, or establish full-release conformance. Closing that task needs
an explicit owner disposition and, if requirements or architecture change,
Kiro-governed reconciliation with the required independent review. This packet
does not propose or implement a replacement architecture.

## Publication and release gates still separate

The [publication checklist](../../../PUBLICATION-CHECKLIST.md) requires two
independent reviews against the same pinned v0.3 candidate package. That gate
is recorded in the
[publication-readiness synthesis](../../v0.3-candidate-publication-readiness.md).
Joe authorized the bounded HACP and WITS regeneration, repinning,
documentation corrections, validation, and governed PRs needed to publish the
candidate. The authorization does not permit runtime execution or promote the
candidate to a standard or full release.

Bidirectional production/consumption is the later full-release criterion under
#47. [HACP #52](https://github.com/joefeser/hacp/issues/52), synthetic identity
limitations, non-portable expiry/revocation evidence, persisted-ordering limits,
and common-mode canonicalize library risk remain disclosed. Neither transport
nor conformance validation grants authority.

## Recording an owner return

Record the exact evidence refs above, Joe's decision date, the disposition for
Decision 1, the separately selected disposition for Decision 2, and any specific
follow-up. Unanswered decisions remain pending. Preserve the WITS Task 1.3f
limitation and the publication/release gates unless separately resolved by
explicit evidence and authority. A generic "merged" or "next phase" instruction
is not recorded as acceptance of these normative decisions.
