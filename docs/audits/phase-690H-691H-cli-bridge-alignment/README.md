# Phase 690H/691H CLI Bridge Alignment Audit

Decision token: `no_hacp_update_needed`

Date: 2026-06-08

## Summary

This audit checked the public HACP repository against the app-proven
Phase 690/691 no-exec CLI bridge chain from `joefeser/what-is-the-spec`.

The public HACP draft is aligned enough for the current no-exec CLI bridge
story. No protocol semantic patch, schema change, version bump, or README/docs
clarification is recommended in this phase.

The current public materials already state that HACP records, transport,
profiles, diagnostics, report proof, and import verification are evidence and
boundary records. They do not execute commands, call models or tools, mutate
GitHub, dispatch runtime work, approve outcomes, certify completion, or replace
human decision.

## App Evidence Read

The app-side evidence reviewed was limited to these files from
`joefeser/what-is-the-spec`:

- `docs/hacp/cli-bridge/phase-690-691/decision.md`
- `docs/hacp/cli-bridge/phase-690-691/no-exec-cli-bridge-e2e-trial.md`
- `docs/hacp/cli-bridge/phase-690-691/evidence-chain-readback.json`
- `docs/coordination-trial/phase-runway.md`

The app decision token was
`no_exec_cli_bridge_e2e_trial_ready`.

The app evidence records a deterministic evidence-only chain:

1. `owner-cli packet check --json`
2. `owner-cli report emit --not-executed --json`
3. product import preview from the emitted CLI artifact
4. human decision readback

The app evidence explicitly preserves:

- no hosted execution;
- no owner command execution;
- no product import persistence;
- no GitHub mutation;
- no model or tool calls;
- no completion or merge-readiness inference;
- human decision required before any future execution or persistence.

## Public HACP Sources Reviewed

Core public sources:

- `README.md`
- `docs/review-packet.md`
- `docs/hacp-0.2.md`
- `docs/non-goals.md`
- `docs/profiles.md`
- `docs/security-boundaries.md`
- `docs/use-cases.md`
- `docs/workflows/owner-controlled-bridge.md`
- `docs/cli-bridge-contract/v0/README.md`
- `docs/cli-bridge-contract/v0/objects.md`
- `docs/cli-bridge-contract/v0/canonical-digest-rules.md`
- `docs/cli-bridge-contract/v0/diagnostics-and-stop-reasons.md`
- `examples/cli-bridge-contract/v0/README.md`
- `examples/public-packaging/v0/README.md`

Issue context:

- `#9` Add HACP 0.2 conformance fixtures with real JCS digests
- `#10` Explore HACP 0.3 multi-human decision policy
- `#11` Add HACP 0.2 from 0.1 catch-up guide
- `#12` Explore reply, correlation, and causation identifiers
- `#13` Explore priority, severity, due date, and riskClass metadata

## Audit Answers

### 1. Records and evidence do not execute work

Aligned.

`README.md`, `docs/non-goals.md`, `docs/review-packet.md`,
`docs/security-boundaries.md`, and `docs/cli-bridge-contract/v0/README.md`
all state that HACP does not run shell/model/tool work, invoke CLIs, mutate
GitHub, dispatch runtime work, or replace human approval.

The CLI bridge candidate additionally says bridge evidence is not hosted
execution, runner dispatch, model/tool calling, queue publishing, external
mutation, work completion, or approval to merge, deploy, ship, cancel, or
accept risk.

### 2. Authority packet, packet check, owner-controlled local report, product/import verification, and human decision are distinct

Aligned.

The public HACP 0.2 record model separates Authority Packet, Handoff Package,
Adapter Report, Match Proof, and Human Decision Record. The CLI bridge
candidate maps the app-proven bridge into public objects:

- Requested CLI Work Packet;
- Packet/Profile Preflight Result;
- Runner Report With Approved Profile Proof;
- Evidence Import Verification Result;
- Evidence Import Summary.

The public docs preserve the owner-system/verifier boundary and keep the human
decision as the only record that can convert reviewed evidence into a recorded
decision.

### 3. Proof is evidence, not approval

Aligned.

The core docs say match proof is custody evidence, not approval. The CLI bridge
docs say report proof is not trusted before packet, report, and approved
profile proof digests are verified, and that import verification does not
record durable completion, approve merge, accept risk, or change product state.

### 4. Public docs avoid execution, model/tool, GitHub, approval, completion, compliance, runtime, service-bus, and transport-authority overclaims

Aligned.

The reviewed sources repeatedly preserve these non-claims:

- HACP is not an autonomous orchestration runtime.
- HACP is not a hosted shell.
- HACP is not model/tool routing authority.
- HACP is not GitHub mutation authority.
- HACP is not a runtime dispatcher.
- HACP is not a RabbitMQ replacement.
- HACP is not a replacement for human approval.
- HACP does not prove completion by report presence or verification.
- Transport moves records but does not create or widen authority.

One older workflow page,
`docs/workflows/owner-controlled-bridge.md`, includes an illustrative
`runner execute --command "npm run test:unit"` shape. The same page says the
repository does not ship those commands and that HACP does not execute work by
itself. Because the newer CLI bridge contract and README carry the no-exec
boundary more explicitly, this is not treated as concrete public-doc drift in
this phase.

### 5. Public example need

No new public example is recommended yet.

The repo already has `docs/cli-bridge-contract/v0/` and
`examples/cli-bridge-contract/v0/`, including ready/blocked doctor output,
profile proof, runtime/toolchain mismatch, risky flag approval failure, waiver,
requested CLI work packet, and approved tool profile examples.

Adding a Phase 690/691-specific public example now would risk importing
product-side implementation details before independent feedback exists.

### 6. Approved tool profile coverage

Aligned enough for public candidate status.

The public docs and examples cover:

- pinned tool/profile identity, version, and digest;
- allowed command shape;
- required and forbidden parameters;
- risky flag approval references;
- runtime/toolchain expectations;
- network/write policy;
- expiry and ownership/stewardship;
- fail-closed preflight;
- digest-bound authority fields;
- profile proof and report import diagnostics.

The open conformance-fixture issue `#9` covers future real JCS digest vectors,
but it is not a blocker for this audit because the current examples are
clearly marked as placeholder/readability fixtures rather than conformance
vectors.

### 7. Existing issue coverage

Issues `#9` through `#13` cover future conformance, catch-up, interop,
multi-human, and triage/profile questions. They do not identify a current
Phase 690/691 no-exec public wording gap.

No new issue is recommended from this audit.

## Validation

Validation results are recorded in
[`decision.md`](decision.md).

## Related Files

- [`claim-safety-check.md`](claim-safety-check.md)
- [`recommended-patch-packet.md`](recommended-patch-packet.md)
- [`decision.md`](decision.md)
