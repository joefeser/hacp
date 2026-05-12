# HACP 0.2 Risk Case Fixtures

These fixtures show minimal review-condition examples. They are not
cryptographic conformance vectors. Digest values are placeholders.

- `stale-handoff.json`: match proof shows a report matched an older handoff
  and needs review.
- `stale-handoff-adapter-report.json`: minimal adapter report referenced by
  the stale handoff proof.
- `matrix-drift.json`: match proof shows decision rules changed between
  handoff and review.
- `matrix-drift-adapter-report.json`: minimal adapter report referenced by the
  matrix drift proof.
- `boundary-breach.json`: adapter report says boundaries were not preserved.
- `boundary-breach-match-proof.json`: match proof carries the resulting
  `boundary_breach` review condition.
- `manual-override-match-proof.json`: match proof shows the required human actor
  and reason for a manual override. It uses `stale_handoff` as one possible
  review condition, not as the only reason to use `manual_override`.
- `manual-override-adapter-report.json`: minimal adapter report referenced by
  the manual override proof.
- `boundary-breach-human-decision-record.json`: human decision record that
  carries non-empty review conditions forward from a boundary breach proof.
