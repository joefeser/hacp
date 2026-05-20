# HACP Stop Response Decision Guide

## Purpose

Stop responses are safety successes. They tell the human owner that an agent,
tool, or reviewer cannot continue safely from the evidence it has. A stop
response should preserve what is known, name what is not known, and ask for the
smallest correction that would unblock the loop.

Use this guide when a task packet, report, review, or implementation loop needs
to stop instead of guessing, overreaching, or reporting fake confidence.

## Minimal Response Shape

```text
Stop reason: <CODE>
What does not line up: <short explanation>
Evidence: <specific packet/context/runtime evidence>
Minimal correction: <smallest human or upstream change to unblock>
Authority context: <what this stop does not approve, execute, or imply>
[do_not_continue_based_on_incomplete_readback: true]
```

The response should be short enough for a human to act on, but concrete enough
that the next actor does not need to reverse-engineer the failure.

## Quick Decision Table

| Situation | Use this stop reason | Minimal correction |
| --- | --- | --- |
| The prompt, branch, PR, tool mode, or packet does not match the requested work. | `CONTEXT_MISMATCH` | Provide the matching packet, branch, PR, or mode. |
| A required executable, credential, database, browser, service, or local fixture is unavailable. | `ENVIRONMENT_BLOCKED` | Restore the missing environment dependency or provide an alternate approved environment. |
| A specific claim is not proven, but the agent can name the exact missing proof. | `UNVERIFIED_ASSUMPTION` | Provide the missing readback, validation result, or source artifact. |
| The agent cannot prove final state because reliable runway has ended. | `RELIABILITY_LIMIT_REACHED` | Re-anchor state from live source of truth before continuing. |
| The next step requires a human approval, risk decision, merge decision, rejection, or scope choice. | `HUMAN_DECISION_REQUIRED` | Human owner records the decision or changes the packet authority. |

## Unverified Assumption Vs Reliability Limit

Use `UNVERIFIED_ASSUMPTION` when one specific claim is not proven and the
missing proof is narrow. The loop can still be understandable because the agent
can say exactly which claim needs evidence.

Use `RELIABILITY_LIMIT_REACHED` when the overall reliable runway is gone. This
means the agent cannot safely infer readiness from incomplete, stale, missing,
or contradictory state. A reliability-boundary stop should include verified
state, unverified state, last safe branch/commit/PR when relevant, pending
external readback, and `do_not_continue_based_on_incomplete_readback: true`.

Bad response:

```text
Looks fine. I think the checks probably passed.
```

Better response:

```text
Stop reason: RELIABILITY_LIMIT_REACHED
What does not line up: I cannot prove the latest PR head has completed checks.
Evidence: Local validation passed on commit abc1234, but PR check readback is missing.
Minimal correction: Re-run live PR check harvest for the latest head before merge.
Authority context: This stop does not approve, merge, dispatch, or accept risk.
do_not_continue_based_on_incomplete_readback: true
```

## Common Stop Examples

### CONTEXT_MISMATCH

Use when the work request and available context point at different targets.

Bad response:

```text
I will continue on this branch and assume it is the right one.
```

Better response:

```text
Stop reason: CONTEXT_MISMATCH
What does not line up: The task packet names PR #42, but the local branch is feat/example-41.
Evidence: git branch shows feat/example-41; packet target says feat/example-42.
Minimal correction: Switch to the branch named in the packet or provide an updated packet.
Authority context: This stop does not approve, merge, dispatch, or resolve GitHub threads.
```

### ENVIRONMENT_BLOCKED

Use when the packet is clear but a required local or external dependency is not
available.

Bad response:

```text
I skipped the browser test because the browser was not working.
```

Better response:

```text
Stop reason: ENVIRONMENT_BLOCKED
What does not line up: Browser QA is required, but the local app cannot start.
Evidence: The dev server exits before binding to the configured localhost port.
Minimal correction: Restore the app runtime or approve a different validation environment.
Authority context: This stop does not certify UI behavior or mark validation complete.
```

### UNVERIFIED_ASSUMPTION

Use when a claim would be useful but is not supported by the available evidence.

Bad response:

```text
The reviewer probably saw the latest patch.
```

Better response:

```text
Stop reason: UNVERIFIED_ASSUMPTION
What does not line up: I cannot prove the reviewer comment applies to the latest head.
Evidence: The comment references the old short SHA, and no latest-head review is recorded.
Minimal correction: Harvest review evidence for the current PR head or mark the finding stale.
Authority context: This stop does not dismiss the finding or accept the risk.
```

### RELIABILITY_LIMIT_REACHED

Use when continuing would turn incomplete readback into fake confidence.

Bad response:

```text
No active findings that I noticed, so it should be safe to merge.
```

Better response:

```text
Stop reason: RELIABILITY_LIMIT_REACHED
What does not line up: The monitor reached its polling ceiling while required bot analysis was still pending.
Evidence: Local tests passed, but expected bot check readback has not reached a terminal state.
Minimal correction: Re-check the PR after the expected bot reports or change the loop policy.
Authority context: This stop does not approve, merge, dispatch, continue, or accept risk.
do_not_continue_based_on_incomplete_readback: true
```

### HUMAN_DECISION_REQUIRED

Use when the system can show the state but only the human owner can choose the
next authority-bearing action.

Bad response:

```text
I accepted the risk and moved on.
```

Better response:

```text
Stop reason: HUMAN_DECISION_REQUIRED
What does not line up: The report contains a residual risk that requires owner approval.
Evidence: The agent report says validation passed with one unresolved security caveat.
Minimal correction: Human owner records accept risk, reject risk, request changes, or mark blocked.
Authority context: This stop does not accept risk, approve work, or create follow-up authority.
```

## Other Canonical Stop Reasons

This guide expands the five stops most often confused during manual handoff and
PR-loop work. HACP also defines these canonical stop reasons:

- `WRONG_TOOL_OR_MODE`
- `MISSING_AUTHORITY`
- `SCOPE_CONFLICT`
- `STALE_PACKET`

Use the full canonical list in
[open-playbook-template-pack/stop-reasons.md](open-playbook-template-pack/stop-reasons.md)
when a packet, playbook, or implementation needs the complete vocabulary.

## Authority Boundary

A stop response reports inability to proceed safely. It does not approve work,
does not merge, does not dispatch, does not execute, does not resolve GitHub
threads, does not write GitHub, does not call models, does not contact agents,
does not accept risk, and does not imply completion or downstream receipt.

If the next action needs authority, the minimal correction should name the
human decision or upstream packet change required to grant it.
