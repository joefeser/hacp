# Phase 692H/693H Watch Packet

Decision token: `defer_hacp_update_until_real_command_trial`

## Purpose

This packet tells HACP reviewers what to inspect after the app repo completes
the planned Phase 694/695 owner-controlled local command trial.

It does not authorize execution. It does not change HACP public docs, schemas,
examples, profiles, or protocol semantics. It does not claim HACP executes
commands or approves outcomes.

## Expected App Trial Scope

The app-side Phase 694/695 trial should cover exactly one approved command:

```bash
npm run test:unit -- tests/unit/coordination/no-exec-cli-bridge-e2e-trial.test.ts
```

The expected posture is:

- one future owner-controlled local command attempt only;
- no hosted UI/app shell execution;
- no command substitutions, extra params, broader test command, network access,
  secrets, database access, GitHub mutation, model/tool call, runtime dispatch,
  or merge/completion inference;
- packet/profile/preflight/report/import evidence returned to a human decision
  gate.

## Evidence HACP Should Review

After the app-side trial, HACP should inspect evidence for each step below.

| Evidence area | Expected evidence |
| --- | --- |
| Phase decision | App Phase 694/695 decision file with the final trial decision token and scope. |
| Authority packet | The packet id, packet digest, command text, max-attempt policy, environment policy, network policy, output limit, and write policy used before execution. |
| Approved profile | The profile id, profile version, profile digest, command family, required command shape, forbidden params, network/write posture, and expiry or review boundary. |
| Preflight | Proof that packet digest, profile digest, exact command, working directory, toolchain version, environment policy, network policy, output capture policy, and report path were checked before execution. |
| Runner custody | Evidence that only an owner-controlled local runner attempted the command and that the hosted app/UI did not execute shell commands. |
| Command attempt | Start/end timestamps, exact command, attempt count, exit code, timeout status, stdout/stderr byte counts, overflow flags, sanitized environment variable names, and no-secret capture policy. |
| Output handling | Evidence that stdout/stderr overflow failed closed, if overflow occurred, and that captured output digests match imported artifacts. |
| Report digest | The emitted report digest and the canonicalization method used for digest material. |
| Import verification | Proof that the report digest and referenced artifact digests were verified before the report was trusted or summarized. |
| Canonical sorting | Evidence that deterministic canonical key sorting was used for report/import digests. |
| Human gate | Evidence that the imported report was routed to a human decision gate before any next consequential step. |
| Non-claims | Explicit preservation that the report proves custody/review evidence only, not completion, compliance, approval, merge readiness, launch readiness, or conformance completion. |

## Patch Trigger

A later HACP docs/schema/example patch may be recommended only if the app trial
evidence shows a concrete public HACP gap, such as:

- current public docs could reasonably be read as saying HACP itself executes
  commands;
- current docs blur hosted app execution and owner-controlled local execution;
- report/import proof language is insufficient to prevent completion,
  compliance, approval, or conformance overclaims;
- digest verification or canonical key sorting needs a public example or
  clarification to remain interoperable;
- output overflow, command mismatch, preflight failure, packet/profile mismatch,
  report import failure, or human-gate bypass exposes an unclear public HACP
  review condition;
- existing examples contradict the evidence-only and human-decision boundary.

A schema patch should remain a later human-owned decision. This watch packet
does not recommend one now.

## No-Update Trigger

`no_hacp_update_needed` should be considered after the app trial only if the
evidence shows all of the following:

- hosted UI/app did not execute shell commands;
- the owner-controlled local runner attempted only the exact approved command;
- preflight verified packet, profile, command, version, policy, output, and
  report boundaries before execution;
- output overflow failed closed;
- report digest verification happened before trusting imported report evidence;
- deterministic canonical key sorting appeared in report/import digests;
- the report proved custody/review evidence only;
- a human decision gate received the imported evidence before any next
  consequential step;
- current HACP v0.2 public docs remained accurate without semantic expansion.

## Human-Decision Trigger

`human_decision_required` should be used if any material fact is ambiguous,
missing, or unsafe, including:

- hosted UI/app shell execution is observed or cannot be ruled out;
- the runner command differs from the approved command;
- extra params, broader test selection, or additional command attempts appear;
- preflight failed, was skipped, or happened after execution;
- overflow occurred and did not fail closed;
- report/import digests were trusted before verification;
- canonical sorting is absent, inconsistent, or not inspectable;
- report language asserts completion, compliance, approval, conformance
  completion, merge readiness, or launch readiness;
- imported evidence bypassed the human decision gate;
- HACP public docs appear inaccurate but the correct patch is unclear.

## Current Recommendation

No Phase 694/695 trial evidence exists yet, so HACP should defer any public
repo update until that evidence is available.
