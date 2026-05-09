# Example Agent Report

```yaml
hacp_version: v0.1-draft
record_kind: hacp.agent_report
report_id: report-example-0001
packet_id: packet-example-0001
profile_id: hacp-base-draft
profile_version: v0.1-draft
created_at: 2026-05-09T15:20:00Z
created_by: example-agent
surfaces_changed:
  - docs/example.md
behaviour_implemented: Corrected the stale sentence within the approved documentation scope.
verification_performed:
  - git diff -- docs/example.md
blockers: []
residual_risks:
  - No repository docs lint command was available in this minimal example.
requested_next_step: request_review
boundaries_preserved: true
boundary_crossed_reason: null
evidence:
  - examples/minimal-v0.1/packet.md
  - examples/minimal-v0.1/transcript-diff.log
```
