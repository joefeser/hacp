# ACK PR-Loop Worker Runbook

Use the repo-local ACK lane after opening a PR. Do not run a status-only check
as the final gate.

## Required command

```bash
agent-control pr-loop --repo OWNER/REPO --pr NUMBER --base <base> --require-codex-review --wait-for-fresh --max-wait-seconds 600 --quiet --json-summary --handoff-out .agent-control/pr-loop-handoffs/pr-NUMBER.json
```

ACK loads `.agent-control/lanes/pr-review-loop.yaml` from the repo by default.
Verify local capability with `agent-control version --json` before relying on
review quorum, required reviewer batching, quiet JSON, or freshness waiting.

## Worker rules

- Run the full ACK loop after opening a PR.
- Do not manually retag Codex, Qodo, Gemini, or Sourcery.
- Patch only when `nextAction` is `patch_actionable_findings`.
- Read `patchBriefAbsolutePath` before fetching GitHub review bodies manually.
- If `staleFindingCount > 0`, do not guess sleeps. Let ACK wait or use the
  disposition path it provides.
- Keep docs-only work separate from schema, script, package, CI, runtime, or
  authority-boundary changes.
- Do not squash merge by default.
- Report the final ACK `decision`, `stopReason`, `nextAction`, head SHA, and
  exact merge recommendation.

## Branch posture

Use `dev` or `integration/**` targets for agent loops when applicable.
Promotion to `main` is owner-mediated. A clean main promotion owner decision is
not normal overnight auto-merge, and stale or delayed reviewer evidence on
large main promotions should be reported plainly rather than treated as an agent
failure.

## Validation

For this repo, run focused validation for changed files. Common checks are:

```bash
agent-control doctor --json
npm run hacp:cli-bridge-examples
git diff --check
```

Run `npm run hacp:doctor -- <path> [--json]` only when the change touches HACP
JSON artifacts that need artifact-level validation.
