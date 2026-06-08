# Phase 696H/697H Decision

Decision token: `no_hacp_update_needed`

## Decision

No HACP public repo update is needed after reviewing the merged app-side Phase
696/697 clean-baseline single allowlisted command trial evidence.

The reviewed app evidence confirms that the current HACP v0.2 public docs,
CLI bridge candidate docs, security boundaries, non-goals, and prior
Phase 692H/693H watch packet remain accurate.

## Evidence Source

App repo:
`joefeser/what-is-the-spec`

Merged source ref:
`origin/dev`

Merged source commit:
`666f1ed53bd1f58722d196f254c2b350eab707ec`

Evidence directory:

```text
docs/hacp/cli-bridge/phase-696-697/
```

App decision token:
`single_allowlisted_command_trial_clean_baseline_ready`

## Basis

The live-state gate passed:

- HACP `origin/main` contains the Phase 692H/693H watch packet.
- App `origin/dev` contains the required Phase 696/697 evidence files.
- App `origin/dev` records the required decision token.

The app trial evidence shows:

- the hosted product did not execute shell commands;
- the owner-controlled local runner executed exactly one approved command;
- preflight passed before command execution;
- packet/profile/command/runtime/environment/network/output/report boundaries
  were recorded;
- stdout/stderr capture stayed within caps;
- report/import evidence recorded matching report digest readback;
- deterministic key sorting appears in the report/import JSON artifacts;
- accepted evidence stayed custody/review evidence only;
- a human decision gate remained required before any consequential next step;
- network observation wording did not claim kernel-enforced sandboxing.

## HACP Patch Needed

No.

HACP public docs, examples, schemas, protocol semantics, and profiles are
intentionally left unchanged.

## Issue Needed

No.

No schema/protocol change or public documentation gap was found.

## Validation

- `npm run hacp:doctor -- schemas/examples --manifest schemas/examples/manifest.json`:
  passed, with 15 expected-valid and 9 expected-invalid fixtures.
- `npm run hacp:doctor -- schemas/examples/valid`: passed.
- `npm run hacp:cli-bridge-examples`: passed for 8 files.
- `git diff --check`: passed.

## Review Tooling

Preferred `claude-sonnet-4.6` review was attempted through the local
`claude` CLI with:

```bash
claude -p --model claude-sonnet-4-6 --permission-mode bypassPermissions --dangerously-skip-permissions --output-format text "Review the uncommitted HACP docs audit packet changes for Phase 696H/697H. Use git diff and relevant files only. Focus on factual errors, unsafe HACP boundary claims, missing validation/review records, and decision-token consistency. Do not edit files. Return severity-ordered findings with file/line references, or state no findings."
```

The CLI returned `Not logged in`. No Sonnet findings are claimed.

Fallback `auto` review was run with:

```bash
codex review --uncommitted
```

The fallback review reported one P2 finding: replace the pending validation and
review sections in this decision file before merge. This decision file was
updated to address that finding.

Follow-up fallback review was run again with:

```bash
codex review --uncommitted
```

The follow-up review reported two P2 findings:

- include the core `docs/hacp-0.2.md` spec in the reviewed-docs record;
- avoid relying on artifact-only digest readback as proof that import
  verification recomputed the report digest before trust.

This packet was updated to include `docs/hacp-0.2.md` in the reviewed-docs list
and to cite the app-side verifier/test evidence at `origin/dev` for digest
recomputation and `REPORT_DIGEST_MISMATCH` rejection.
