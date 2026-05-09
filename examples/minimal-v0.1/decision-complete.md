# Example Human Decision Gate: Mark Complete

```yaml
hacp_version: v0.1-draft
record_kind: hacp.human_decision_gate
decision_id: decision-example-complete-0001
session_id: session-example-0001
packet_id: packet-example-0001
profile_id: hacp-base-draft
profile_version: v0.1-draft
actor_id: human-operator-1
actor_kind: human
actor_verification_source: server_session_with_human_interaction
authentication_context: browser_session
decision: mark_complete
decision_matrix_version: v0.1-draft
from_status: in_progress
to_status: completed
reason: Close the bounded documentation task after report and review finding; completion does not imply ship or risk acceptance.
created_at: 2026-05-09T15:40:00Z
evidence:
  - examples/minimal-v0.1/packet.md
  - examples/minimal-v0.1/report.md
  - examples/minimal-v0.1/finding.md
```
