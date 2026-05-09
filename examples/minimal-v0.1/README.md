# HACP Minimal v0.1 Reference Example

This directory is a tiny, copyable HACP fixture. It is not a conformance suite.
It exists to make the v0.1 RFC contracts concrete enough for reviewers and early
implementers to inspect.

The example models one bounded documentation task:

1. A human actor approves a Task Packet.
2. A human actor starts the approved work.
3. The packet is rendered for manual transport.
4. An agent returns an Agent Report.
5. A reviewer records one Review Finding.
6. The human actor marks the session complete.
7. The audit export links the packet, decisions, report, finding, and transport
   render event.

## Artefacts

- [packet.md](packet.md): approved Task Packet rendering.
- [decision-approve.md](decision-approve.md): Human Decision Gate approval.
- [decision-start.md](decision-start.md): Human Decision Gate transition into
  active work.
- [report.md](report.md): Agent Report returned by the recipient.
- [finding.md](finding.md): Review Finding recorded against the report.
- [decision-complete.md](decision-complete.md): Human Decision Gate closeout.
- [transcript-diff.log](transcript-diff.log): minimal verification transcript.
- [audit.jsonl](audit.jsonl): portable JSON Lines audit export.

## Notes

- The example uses the HACP base profile:
  `profile_id = hacp-base-draft`, `profile_version = v0.1-draft`.
- The packet includes an `approval` reference, so it is transportable authority.
- The example is single-pass. `loop_ceiling = 0` means no additional
  review/fix packet may be approved after the first returned report or finding.
- Manual transport is render-only. No delivery, shell, queue, webhook, model API,
  or watched pickup location is implied.
- The example does not claim production readiness, vendor neutrality, or
  independent implementation conformance.
