# HACP Safe Stop And Reliability Boundary

## Purpose

A safe stop is the correct HACP response when an agent can no longer prove it
is operating from reliable state. It is a safety success, not an agent failure.

Use a safe stop when continuing would require guessing about branch state, PR
checks, review comments, tool mode, authority, environment, or stale context.
The agent should stop with a concrete artifact instead of producing fake
confidence.

## Stop Reason

Use `RELIABILITY_LIMIT_REACHED` when the agent has reached the end of reliable
runway.

This reason means:

- verified state, if any, should be preserved;
- unverified state remains and must not be treated as fact;
- the next actor needs a minimal, concrete readback or human correction;
- merge, dispatch, continuation, approval, or risk acceptance is not proven.

## Required Readback

A reliability-boundary stop response should include:

- stop code: `RELIABILITY_LIMIT_REACHED`;
- verified state;
- unverified state;
- last safe branch, commit, and pull request;
- pending checks, reviews, or other external readback;
- recommended next action;
- explicit `do_not_continue_based_on_incomplete_readback: true`.

The state arrays are required fields. They may be empty when the truthful
readback is "none recorded," but they must not be omitted.

## Minimal Shape

```text
STOP: RELIABILITY_LIMIT_REACHED

Verified:
- <branch/commit/PR or local validation fact>

Not verified:
- <pending check/review/thread/state>

Last safe state:
- Branch: <branch>
- Commit: <commit>
- Pull request: <url>

Recommended next action:
- <smallest concrete readback or human correction>

Do not merge, dispatch, approve, or continue based on this incomplete readback.
```

## JSON Example

Use
[`schemas/examples/valid/stop-response.reliability-boundary.valid.json`](schemas/examples/valid/stop-response.reliability-boundary.valid.json)
for a schema-valid JSON example.

## What This Does Not Do

- It does not merge or approve work.
- It does not resolve GitHub threads.
- It does not dispatch another agent.
- It does not call models.
- It does not retry forever.
- It does not convert incomplete readback into readiness.

## See Also

- [quickstart.md](quickstart.md)
- [stop-response-decision-guide.md](stop-response-decision-guide.md)
- [schemas/README.md](schemas/README.md)
- [open-playbook-template-pack/stop-reasons.md](open-playbook-template-pack/stop-reasons.md)
