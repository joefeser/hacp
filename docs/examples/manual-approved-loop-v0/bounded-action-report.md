# Bounded Action Report

A bounded action report is evidence about what happened under approved scope. It
is not permission to continue, retry, publish, standardize, or execute a new
lane.

## Illustrative Report Sketch

The YAML below is illustrative documentation, not a schema-valid HACP artifact.
Do not copy it as a base record; use the published schemas for validated
artifacts.

```yaml
bounded_action_report:
  report_id: bar_manual_loop_v0_example
  source_task_packet: task_packet_manual_loop_v0_example
  approved_scope:
    - "Create documentation-only evidence examples."
    - "Keep copy vendor-neutral and non-hype."
    - "Preserve proof-is-evidence-not-approval wording."
  completed_under_scope:
    - "Recorded the manual approved-loop evidence chain."
    - "Recorded count boundaries for retries, continuations, and runtime work."
    - "Returned evidence to the human decision gate."
  not_performed:
    - runtime execution
    - transport execution
    - HTTP hooks
    - RabbitMQ
    - watcher or polling behavior
    - durable persistence
    - hosted shell execution
    - model or tool calls
    - retry
    - second attempt
    - autonomous continuation
  requested_next_step: request_human_decision
```

## Boundary

The report can support later review. It cannot approve another action, broaden
authority, or prove production/compliance/certification readiness.

## Related Files

- [Human decision gate](./human-decision-gate.md)
- [No retry, no autonomous continuation](./no-retry-no-autonomous-continuation.md)
- [Manual loop is not runtime/transport/self-running](../../concepts/manual-loop-is-not-runtime-transport-self-running.md)
