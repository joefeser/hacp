# Example Task Packet

```yaml
hacp_version: v0.1-draft
record_kind: hacp.task_packet
packet_id: packet-example-0001
profile_id: hacp-base-draft
profile_version: v0.1-draft
packet_state: approved
created_at: 2026-05-09T15:00:00Z
created_by: human-operator-1
approval:
  decision_id: decision-example-approve-0001
  actor_id: human-operator-1
  actor_kind: human
  approved_at: 2026-05-09T15:05:00Z
  approved_body_hash:
    algorithm: sha256
    canonicalization: hacp-yaml-v0.1
    digest: sha256:2f7e5c53a6c7a68b2d3ef7e19dbf820d6c7c286471f5cfbc0cbfdf4edfd7c1a4
target_label: example-agent
mode: implement
authority: implement_bounded
authority_impact: modifies_allowed_surfaces
scope: Correct one stale sentence in examples/minimal-v0.1/example.md without changing source code.
allowed_surfaces:
  - examples/minimal-v0.1/example.md
forbidden_surfaces:
  - app/**
  - lib/**
  - prisma/**
stop_conditions:
  - Stop after the documentation correction and verification transcript.
  - Stop if the correction requires source code changes.
  - Stop if any requested action would exceed implement_bounded authority.
verification_requirements:
  - git diff -- examples/minimal-v0.1/example.md
required_report_shape: hacp-agent-report-draft
evidence_visibility: internal_only
loop_ceiling: 0
```

## Transport Contract

```yaml
manualTransport:
  transport_profile_id: hacp.manual_transport
  transport_profile_version: v0.1-draft
  productAction: render_only
  deliveryBoundary: human_owner_outside_product_runtime
  outboundTransport: none
  renderAuthenticationContext: browser_session  # one of: browser_session, api_header
```
