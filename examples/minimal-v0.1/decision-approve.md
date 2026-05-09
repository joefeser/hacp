# Example Human Decision Gate: Approve Packet

```yaml
hacp_version: v0.1-draft
record_kind: hacp.human_decision_gate
decision_id: decision-example-approve-0001
session_id: session-example-0001
packet_id: packet-example-0001
profile_id: hacp-base-draft
profile_version: v0.1-draft
actor_id: human-operator-1
actor_kind: human
actor_verification_source: server_session_with_human_interaction
authentication_context: browser_session
decision: approve_next_packet
decision_matrix_version: v0.1-draft
from_status: draft
to_status: approved
reason: Approve bounded documentation correction; no source code, release, or risk-acceptance authority granted.
created_at: 2026-05-09T15:05:00Z
evidence:
  - examples/minimal-v0.1/packet.md
```
