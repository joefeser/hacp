# Public Package Sync (Phase 462/463)

## Scope

This phase aligns public-facing protocol/package messaging in `hacp` with the
claim-safe evidence package approved in `what-is-the-spec` Phase 456/457 and
Phase 460/461.

This is documentation/package framing work only.

## Source Evidence Paths

- `../what-is-the-spec/docs/public-messaging/phase-456-457/claim-safe-overview.md`
- `../what-is-the-spec/docs/public-messaging/phase-456-457/buyer-facing-one-liner.md`
- `../what-is-the-spec/docs/public-messaging/phase-456-457/controlled-trial-proof-points.md`
- `../what-is-the-spec/docs/public-messaging/phase-456-457/do-not-claim-list.md`
- `../what-is-the-spec/docs/public-messaging/phase-456-457/messaging-summary.md`
- `../what-is-the-spec/docs/public-messaging/phase-460-461/next-public-packaging-decision.md`
- `../what-is-the-spec/docs/public-messaging/phase-460-461/forbidden-claim-scan.md`
- `../what-is-the-spec/docs/public-messaging/phase-460-461/summary.md`

## Allowed Claims Used

- HACP is a human-approved coordination control layer for agent-assisted
  engineering work.
- The current dogfood slice helps preserve evidence, authority boundaries, and
  human merge decisions around PR review workflows.
- The product can show controlled-trial evidence for PR review and CLI report
  decision surfaces.
- The current implementation is a local/product-controlled trial slice, not an
  autonomous execution platform.

## Forbidden Claims Checked

Forbidden-claim vocabulary from Phase 456/457 was checked against changed docs.
No forbidden affirmative claims were added.

## Files Changed

- `README.md`
- `adoption-primer.md`
- `docs/use-cases.md`
- `docs/public-package-sync-phase-462-463.md`

## Validation Results

- `npm run kiro:review -- --phase hacp-protocol-package-sync --kind spec --model claude-opus-4.8 --fresh`: `ENVIRONMENT_BLOCKED` (script unavailable)
- `npm run hacp:doctor`: command requires an explicit input path in this repo (`Missing path`).
- `npm run hacp:doctor -- schemas/examples`: pass (`15 expected-valid`, `9 expected-invalid`).
- Additional repo lint/test/build: no additional lint/test/build scripts beyond
  `hacp:doctor` were found in `package.json`.
- `git diff --check`: pass (no whitespace/conflict-marker issues).
- Forbidden-claim scan across changed docs: pass (no matches).
- `npm run kiro:review -- --phase hacp-protocol-package-sync --kind implementation --model claude-sonnet-4.6 --fresh`: `ENVIRONMENT_BLOCKED` (script unavailable)

## Protocol/Schema Invariant

No JSON schemas, protocol semantics, runtime behavior, adapters, RabbitMQ/runtime claims,
hosted execution claims, or customer deployment claims were changed in this phase.
