# WITS v0.3 candidate qualification decision packet

Status: Joe accepted the pinned WITS proof as Option 1 evidence on 2026-09-07.
Domain approval, publication, and WITS Task 1.3f remain open.

## Pinned evidence

| Evidence | Exact ref |
| --- | --- |
| WITS implementation, PR #1367 | `9fa658f7faf2522de6ea12408c784bb987223f00` |
| WITS handoff record, PR #1368 | `5402baf4ba851bf989d7253574af6695e05d02f0` |
| HACP published external validator, PR #55 | `b6c6bf35640515045252803cfe49d75e223a12d9` |
| HACP merged WITS fixtures, PR #56 | `5f65c7e439b9b636e1ac7fd6c2d2500762518380` |

PRs [#56](https://github.com/joefeser/hacp/pull/56) and
[WITS #1368](https://github.com/joefeser/what-is-the-spec/pull/1368) are merged.
The producer commit remains the implementation merge; the later documentation
merge does not change the source of the fixture records.

From HACP's fixture merge, the published external validator accepts all three
WITS bundles and compares the 22 canonical negative diagnostic sets exactly.
The candidate test suite passes 43/43, including the committed WITS fixture
check. The [receipt](supplementary-validation-receipt.json) and
[reproduction note](supplementary-fixtures.md) preserve the original generation
and HACP-side validation. A fresh validation of the merged fixtures reproduced
the receipt's validation result exactly.

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

This return applies to Decision 1 and the exact evidence refs above. It does
not approve Decision 2, publication, closure of Task 1.3f, or merge of PR #57.

## Decision 2: exact candidate digest domains

Owner status: **pending; normative approval not established by this packet**.

The published [candidate README](../../../schemas/v0.3-candidate/README.md)
requires Joe's approval of the exact set before candidate publication:

1. `org.hacp.task-packet.v0.3-candidate`
2. `org.hacp.human-decision.v0.3-candidate`
3. `org.hacp.consumption-receipt.v0.3-candidate`
4. `org.hacp.continuation-context.v0.3-candidate`
5. `org.hacp.agent-report.v0.3-candidate`
6. `org.hacp.review-finding.v0.3-candidate`
7. `org.hacp.stop-response.v0.3-candidate`
8. `org.hacp.successor-start-evidence.v0.3-candidate` (supporting record)

Approval must identify this exact set and its candidate scope. A changed string
requires a contract change and regeneration of affected digests; this packet
makes no such change. Qualification acceptance does not imply domain approval.

## WITS residual requiring separate disposition

Task 1.3f remains open in the Kiro-governed WITS specification. R4B requires the
final atomic statement's single trusted clock read to supply all admission
timestamp carriers. The implementation instead constructs digest-bearing records
from a prior post-lock database observation, then rechecks time and expiry in
the final atomic CTE. The prior observation does not satisfy the final expiry
predicate. The stronger common-time provenance assertion remains unproven.

An Option 1 decision can record this limitation as part of the conformance
evidence. It cannot silently amend WITS R4B, mark Task 1.3f complete, accept
operational risk on Joe's behalf, or enable a runtime. Closing that task needs
an explicit owner disposition and, if requirements or architecture change,
Kiro-governed reconciliation with the required independent review. This packet
does not propose or implement a replacement architecture.

## Publication and release gates still separate

The [publication checklist](../../../PUBLICATION-CHECKLIST.md) requires two
independent reviews against the same pinned v0.3 candidate package before
publication readiness. This packet does not certify that gate: prior WITS spec
reviews and a merged fixture PR are not evidence of two reviews of this exact
merged package. It does not schedule another WITS spec review round.

The checklist's owner-accepted external proofs and other publication items also
retain their existing status. A later publication-readiness pass must bind each
claimed gate to its own evidence and owner decisions; two approvals alone do
not complete the checklist. There is no release or publication action here.

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
