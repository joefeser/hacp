# ACK PR-Loop Runbook

Status: repo-local worker guidance.

This repository uses Agent Control Kit (ACK) as the PR-loop and merge-readiness
gate. Workers should use the repo-local lane config at
`.agent-control/lanes/pr-review-loop.yaml`.

## Before Opening A PR

1. Check the local ACK installation:

   ```bash
   agent-control version --json
   agent-control capability list --json
   agent-control onboard doctor --repo OWNER/REPO --base <base> --json
   ```

2. Confirm the lane requirements in `.agent-control/lanes/pr-review-loop.yaml`.
   If the local ACK version or capabilities do not satisfy the lane, stop with
   an environment/config handoff instead of guessing.

3. Keep docs-only work separate from protocol, schema, profile, script,
   package, CI, and ACK config changes when practical. The lane uses different
   review quorum posture for docs-only versus protocol/config changes.

## After Opening A PR

Run the full ACK loop, not a status-only snapshot:

```bash
agent-control pr-loop --repo OWNER/REPO --pr NUMBER --base <base> --require-codex-review --wait-for-fresh --max-wait-seconds 600 --quiet --json-summary --handoff-out .agent-control/pr-loop-handoffs/pr-NUMBER.json
```

Use the PR base branch as `<base>`. For normal HACP agent loops, that is
usually `dev`. `main` promotion remains human-mediated.
ACK may request Codex; it batches the returned Codex and Qodo evidence but
never requests Qodo. Before starting the loop, confirm the repository
integration has started or returned the initial Qodo review. If it has not,
hand off to the owner/coordinator to arrange that initial review outside ACK.
Do not wait for an unrequested reviewer or weaken the required quorum. After
Qodo returns once, retain its evidence; do not request a second return.

Then run:

```bash
agent-control pr-body ensure --repo OWNER/REPO --pr NUMBER --execute --json
```

This verifies the PR body has real Markdown newlines and repairs literal `\n`
sequences if needed.

## Acting On ACK Output

ACK is the authority for next steps:

- Patch only when `nextAction` is `patch_actionable_findings`.
- Read `patchBriefAbsolutePath` before fetching GitHub review bodies manually.
- If `staleFindingCount > 0`, do not invent sleeps or manually retag bots. Let
  ACK wait with `--wait-for-fresh` or use the provided disposition path.
- Do not manually tag Codex, Qodo, Gemini, Sourcery, or other review bots.
- Do not post `@qodo-code-review review`.
- Do not squash merge.
- Do not merge from the ordinary PR loop.

If ACK returns `record_disposition`, record the evidence-backed disposition
through ACK and rerun the loop. If ACK returns
`patch_actionable_findings`, patch, validate, push, and rerun the loop.

## Branch Posture

- Use `dev` or `integration/**` for agent PR loops when applicable.
- Use merge commits.
- `main`, `master`, and `release/**` are human-mediated promotion targets.
- Clean main-promotion owner decisions are not normal overnight auto-merge.
- Stale or delayed reviewer evidence on large main promotions should be
  reported clearly as reviewer evidence state, not treated as agent failure.

## Final Worker Report

Report:

- PR URL;
- branch and head SHA;
- changed files;
- validation commands and results;
- ACK decision, `stopReason`, and `nextAction`;
- reviewer/check/thread state when ACK reports it;
- exact merge recommendation or owner decision needed.

For clean owner-decision states, report ACK's decision exactly and do not spiral
into manual bot retags or unbounded waiting.
