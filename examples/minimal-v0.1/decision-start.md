# Example Human Decision Gate: Start Work

```yaml
hacp_version: v0.1-draft
record_kind: hacp.human_decision_gate
decision_id: decision-example-start-0001
session_id: session-example-0001
packet_id: packet-example-0001
profile_id: hacp-base-draft
profile_version: v0.1-draft
actor_id: human-operator-1
actor_kind: human
actor_verification_source: server_session_with_human_interaction
authentication_context: browser_session
decision: start_work
decision_matrix_version: v0.1-draft
from_status: approved
to_status: in_progress
reason: Start the approved bounded documentation task without changing authority.
created_at: 2026-05-09T15:06:00Z
evidence:
  - examples/minimal-v0.1/packet.md
  - decision-matrix-base-v0.1.yaml
```
