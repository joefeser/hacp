# Owner-Controlled Bridge Workflow

This workflow describes a public-safe bridge where an owner controls execution
while HACP records packet/report/evidence/decision custody.

## Flow

1. Human approves a bounded `TaskPacket`.
2. Packet is exported through CLI or file transport.
3. External/local runner performs bounded work.
4. Runner returns an `AgentReport` with an `EvidenceSet`.
5. Import verifier checks custody/integrity and emits receipt/audit events.
6. Workflow enters `human_decision_required`.
7. Human records a `HumanDecision` or a `StopReason`.

## Example Bridge Paths

CLI:

```bash
npx hacp packet fetch --packet-id pkt_example_001 --out packet.json
npx hacp runner execute --packet packet.json --command "npm run test:unit" --out report.json
npx hacp report submit --packet packet.json --report report.json
```

File transport:

```text
file-drop/incoming/pkt_example_001.task-packet.json
file-drop/outgoing/rpt_example_001.agent-report.json
```

## Required Boundaries

- File/CLI transport moves records but does not grant authority.
- Verification confirms custody/integrity checks, not completion proof.
- Risky transitions require explicit human-issued decision records.
- HACP records and coordinates these steps; it does not execute work by itself.
