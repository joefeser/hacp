# No Retry, No Autonomous Continuation

The manual loop preserves retry count `0`, second attempt count `0`, and
autonomous continuation count `0` unless a later human decision explicitly
approves different authority.

## Boundary Counters

```yaml
manual_loop_boundary:
  retry_count: 0
  second_attempt_count: 0
  autonomous_continuation_count: 0
  transport_runtime_count: 0
  durable_persistence_count: 0
  hosted_shell_count_for_bounded_action: 0
  model_tool_call_count_for_bounded_action: 0
  next_state: human_decision_required
```

## Stop Rule

After the bounded action report is created, the loop stops. Continuing requires
a human decision record that names the next approved step and the denied
authority that remains denied.

This example does not introduce runtime, transport, HTTP hooks, RabbitMQ,
watcher/polling behavior, durable persistence, hosted shell execution,
model/tool calls, retry, a second attempt, or autonomous continuation.

## Related Files

- [Evidence chain](./evidence-chain.md)
- [Human decision gate](./human-decision-gate.md)
- [Manual loop is not runtime/transport/self-running](../../concepts/manual-loop-is-not-runtime-transport-self-running.md)
