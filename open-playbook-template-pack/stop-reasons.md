# Stop Reasons And Valid Reject Response

## Canonical Stop Reasons

- `CONTEXT_MISMATCH`
- `WRONG_TOOL_OR_MODE`
- `MISSING_AUTHORITY`
- `SCOPE_CONFLICT`
- `STALE_PACKET`
- `UNVERIFIED_ASSUMPTION`
- `ENVIRONMENT_BLOCKED`
- `RELIABILITY_LIMIT_REACHED`
- `HUMAN_DECISION_REQUIRED`

## Valid Reject/Stop Response Shape

```text
Stop reason: <CODE>
What does not line up: <short explanation>
Evidence: <specific packet/context/runtime evidence>
Minimal correction: <smallest human or upstream change to unblock>
```

## Usage Notes

- Stop responses are safety successes, not agent failures.
- Use concrete evidence and avoid blame language.
- Prefer smallest-correction guidance over broad redesign requests.
- Use `RELIABILITY_LIMIT_REACHED` when the agent cannot prove final state and
  continuing would require guessing from incomplete readback.

## Boundary Reminder

A stop response reports inability to proceed safely. It does not auto-dispatch remediation work.

## See Also

- [Safe Stop And Reliability Boundary](../safe-stop-reliability-boundary.md)
- [Stop Response Decision Guide](../stop-response-decision-guide.md)
