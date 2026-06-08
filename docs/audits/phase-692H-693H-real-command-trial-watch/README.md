# Phase 692H/693H Real Command Trial Watch Packet

Decision token: `defer_hacp_update_until_real_command_trial`

Date: 2026-06-08

## Summary

This HACP-side watch packet defines what the public HACP repo should inspect
after `joefeser/what-is-the-spec` completes its planned Phase 694/695
single allowlisted command trial.

No app Phase 694/695 real command trial evidence exists in this HACP phase, so
this packet does not recommend a HACP schema, protocol, profile, semantic,
README, or example patch.

For this packet, app trial evidence should be treated as available for a final
HACP-side update decision only after it is committed, merged, or otherwise
handed off as a completed review artifact. Local dirty sibling-worktree files
are useful context, but they are not enough by themselves to replace this
defer decision.

The public HACP boundaries remain unchanged:

- HACP does not execute shell commands.
- HACP does not approve outcomes.
- HACP records and bridge artifacts preserve authority, custody, review, and
  human decision evidence.
- Hosted UI/app surfaces must not execute shell commands.
- Owner-controlled local execution, if performed by the app repo later, must
  return packet/profile/preflight/report/import evidence to a human decision
  gate before any next consequential step.

## Live-State Gate

The required HACP gate passed before this packet was created:

- latest `origin/dev` was fetched;
- `origin/dev` contains
  `docs/audits/phase-690H-691H-cli-bridge-alignment/decision.md`;
- that decision file records decision token `no_hacp_update_needed`.

If those facts are not true when this packet is reused, stop the reuse with
live-state gate marker `STALE_PACKET`. Do not record `STALE_PACKET` as this
packet's decision token.

## App Context Read

The app repo `joefeser/what-is-the-spec` was available locally. The following
context files were read from that repo:

- `docs/hacp/cli-bridge/phase-692-693/decision.md`
- `docs/hacp/cli-bridge/phase-692-693/approved-command-execution-scope-decision.md`
- `docs/hacp/cli-bridge/phase-692-693/single-command-authority-packet.json`
- `docs/hacp/cli-bridge/phase-692-693/approved-tool-profile.json`

Those files approve only one future owner-controlled local command trial in
Phase 694/695. They do not record execution in Phase 692/693.

Approved future command:

```bash
npm run test:unit -- tests/unit/coordination/no-exec-cli-bridge-e2e-trial.test.ts
```

App-side authority packet digest:
`sha256:98522dc88a75b5e7ea1dcec645f464745a97df0d1ede1e69a5e74c8b7a5435a4`

App-side approved profile:
`repo-local-npm-focused-vitest-no-network-v1@1.0.0`

App-side approved profile digest:
`sha256:4a303e92acb576ae7a16a4aed2d259a7158840bb5eabe2312cac27eb2fe47cd5`

## Files In This Packet

- [`watch-packet.md`](watch-packet.md): evidence HACP should inspect after the
  app Phase 694/695 trial.
- [`claim-safety-check.md`](claim-safety-check.md): claims that may strengthen
  and claims that must remain unchanged.
- [`post-trial-review-questions.md`](post-trial-review-questions.md): required
  review questions for the post-trial gate.
- [`decision.md`](decision.md): current HACP decision and validation record.

## Current Outcome

Because no app Phase 694/695 real command trial evidence exists yet, HACP should
defer public repo changes until the later app-side evidence can be reviewed.

Current decision token:
`defer_hacp_update_until_real_command_trial`
