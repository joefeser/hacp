# HACP Adapters And Projections

Adapters and projections carry or display protocol records. They are not core
authority and do not grant approval by themselves.

## Core Rule

Authority remains in explicit `HumanDecision` checkpoints. Transport and read
models never replace those checkpoints.

## Adapter Examples (Transport Paths)

- `npx hacp` CLI commands
- file drop/push transport
- RabbitMQ adapter
- MCP adapter
- webhook adapters

Each adapter may move packets, reports, evidence, and receipts. None of them
approves risky transitions.

## Projection Examples (Read Models)

- OTEL projections
- dashboard/reporting projections
- derived lifecycle summaries

Projections are derived views. They are useful for observability and audits, but
they are not source authority.

## Non-Claims

- HACP does not execute work by itself.
- HACP does not require RabbitMQ.
- HACP does not treat transport success as completion proof.
