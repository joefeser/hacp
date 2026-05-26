# HACP Event Lifecycle

This page summarizes public draft lifecycle events for packet custody, report
custody, and explicit authority decisions.

## Packet Lifecycle

- `packet.received`
- `packet.exported`
- `packet.validated`

## Report Lifecycle

- `report.built`
- `report.ready_for_import`
- `report.import_verifier_checked`

## Decision And Stop Lifecycle

- `human_decision_required`
- `stopped`
- `rejected`

## Boundary Notes

- `report.import_verifier_checked` confirms custody/integrity checks only.
- Verification state is not completion proof.
- Risky transitions require explicit `HumanDecision`.
