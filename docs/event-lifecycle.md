# HACP Event Lifecycle

This page summarizes public draft lifecycle events for packet custody, report
custody, and explicit authority decisions.

These lifecycle labels are public-facing projection labels. They are not a
replacement for base RFC audit `event_type` values or base decision-matrix
status values.

## Packet Lifecycle

- `packet.received`
- `packet.exported`
- `packet.validated`

## Report Lifecycle

- `report.built`
- `report.ready_for_import`
- `report.import_verifier_checked`

## Decision And Stop Lifecycle

- `human_decision_required` (projection label; base status is
  `needs_human_decision`)
- `stopped`
- `rejected`

## Boundary Notes

- Base audit `event_type` vocabulary remains in
  [RFC-0007](../rfcs/0007-audit-trail-and-evidence-set.md).
- Base status vocabulary remains in
  [decision-matrix-base-v0.1.yaml](../decision-matrix-base-v0.1.yaml),
  including `needs_human_decision`.
- `report.import_verifier_checked` confirms custody/integrity checks only.
- Verification state is not completion proof.
- Risky transitions require explicit `HumanDecision`.
