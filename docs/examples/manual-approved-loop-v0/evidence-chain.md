# Manual Approved-Loop v0 Evidence Chain

This example shows a local, manual approved loop. It starts with a
human-approved task packet, records bounded action/report evidence produced
under that authority, and returns to a human decision gate before any next lane
is approved.

This is documentation evidence only. It is not runtime evidence, transport
evidence, self-running evidence, production evidence, compliance evidence,
certification evidence, product-completion evidence, loop-completion evidence,
or formal-standardization evidence.

## Chain

1. A human approves a bounded task packet.
2. A single local manual attempt produces one bounded action report.
3. The report records evidence about what happened under the approved scope.
4. The evidence returns to a human decision gate.
5. A later follow-up action, separately approved by a human, produces one
   later follow-up action report.
6. The loop stops again at a human decision gate.

## Count Boundaries

| Counter | Value |
| --- | ---: |
| First local manual attempt report count | 1 |
| Later follow-up action report count | 1 |
| Retry count | 0 |
| Second attempt count | 0 |
| Autonomous continuation count | 0 |
| Transport/runtime count | 0 |
| Durable persistence count | 0 |
| Hosted shell count for bounded action | 0 |
| Model/tool-call count for bounded action | 0 |

## Related Files

- [Human decision gate](./human-decision-gate.md)
- [Bounded action report](./bounded-action-report.md)
- [No retry, no autonomous continuation](./no-retry-no-autonomous-continuation.md)
- [Proof is evidence, not approval](../../concepts/proof-is-evidence-not-approval.md)
