# HACP Adapters And Projections

Adapters and projections carry or display protocol records. They are not core
authority and do not grant approval by themselves.

## Core Rule

Authority remains in explicit `HumanDecision` checkpoints. Transport and read
models never replace those checkpoints.

## Adapter Examples (Transport Paths)

- implementation CLI commands (for example, owner/operator tooling)
- file drop/push transport
- RabbitMQ adapter
- Model Context Protocol (MCP) adapter
- webhook adapters

Each adapter may move packets, reports, evidence, and receipts. None of them
approves risky transitions.

## Projection Examples (Read Models)

- OpenTelemetry (OTel) projections
- dashboard/reporting projections
- derived lifecycle summaries

Projections are derived views. They are useful for observability and audits, but
they are not source authority.

## Non-Claims

- HACP does not execute work by itself.
- HACP does not require RabbitMQ.
- HACP does not treat transport success as completion proof.
