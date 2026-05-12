# HACP 0.2 Risk Case Fixtures

These fixtures show minimal review-condition examples. They are not
cryptographic conformance vectors. Digest values are placeholders.

- `stale-handoff.json`: match proof shows a report matched an older handoff
  and needs review.
- `matrix-drift.json`: match proof shows decision rules changed between
  handoff and review.
- `boundary-breach.json`: adapter report says boundaries were not preserved.
- `boundary-breach-match-proof.json`: match proof carries the resulting
  `boundary_breach` review condition.
- `manual-override-match-proof.json`: match proof shows the required human actor
  and reason for a manual override.
