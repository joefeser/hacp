# HACP Public Spec Draft

## Status

HACP, the Human-Approved Coordination Protocol, is a working draft for
accountable delegation among humans, agents, and tools. It describes portable
records for bounded work, reviewable evidence, explicit stops, and human
decisions.

HACP is not a standard yet. The current draft is public-facing, vendor-neutral
in intent, and backed by draft JSON Schemas, valid examples, invalid examples,
and a local read-only validation command.

Need the short public explainer first? Start with the
[public site content spine](../site/README.md).

## Purpose

HACP exists for workflows where agents or tools can help with real work, but a
human still owns authority, risk acceptance, and final decisions. A HACP loop
records:

1. what a human approved;
2. what authority and boundaries were granted;
3. what evidence came back;
4. whether the participant stopped instead of continuing;
5. what the human decided after review;
6. whether any follow-up loop remains inside an approved ceiling.

The goal is useful automation with visible authority boundaries, not unchecked
autonomy.

## Design Principles

- Human authority is explicit and cannot be silently delegated away.
- Authority comes from an approved Task Packet, not from chat history or a
  transport mechanism.
- Agent Reports, Stop Responses, Evidence Sets, and Review Findings are
  evidence. They do not approve outcomes.
- Human Decision Gate records are the place where review becomes a recorded
  decision.
- Closed vocabularies should fail closed. Unknown authority, stop, or decision
  values should be rejected or routed to human review.
- Draft artifacts should be readable by humans and mechanically checkable by
  tools.

## Lifecycle

The smallest HACP lifecycle is:

1. A human approves a Task Packet.
2. An agent, tool, or other participant performs bounded work or stops.
3. The participant returns an Agent Report or Stop Response.
4. Evidence, findings, and validation output are gathered for review.
5. A human records a Human Decision Gate decision.
6. A follow-up loop may continue only when the approved packet and Loop Policy
   allow it.

Reports, findings, evidence, and stops remain advisory until a human decision
record exists. A successful report is not approval. A clean validation run is not
approval. A Review Finding is not risk acceptance.

## Core Artifacts

### Task Packet

A Task Packet is the human-approved work boundary. It declares the task scope,
authority, allowed tools, allowed and forbidden surfaces, forbidden effects,
stop conditions, verification requirements, required report shape, evidence
visibility, and loop policy reference.

Start with the valid example:
[`task-packet.valid.json`](../schemas/examples/valid/task-packet.valid.json).

### Agent Report

An Agent Report is the participant's returned evidence. It records what changed,
which verification was performed, whether boundaries were preserved, blockers,
residual risks, evidence references, and the requested next human decision.

An Agent Report may request a next step, but the request is advisory until a
human decision record accepts, rejects, revises, or continues the work.

Start with the valid example:
[`agent-report.valid.json`](../schemas/examples/valid/agent-report.valid.json).

### Human Decision Gate

A Human Decision Gate record captures an explicit human decision after review.
It links to the packet and report when applicable, records actor information,
states the transition, and preserves decision evidence.

HACP does not replace human risk acceptance. It records that a human decision
occurred and what evidence was visible at the time.

Start with the valid example:
[`human-decision.valid.json`](../schemas/examples/valid/human-decision.valid.json).

### Stop Response

A Stop Response is a typed, valid outcome when the participant cannot safely
continue. It records what does not line up, evidence references, minimal
correction guidance, and the authority context.

Canonical stop reasons include:

- `CONTEXT_MISMATCH`
- `WRONG_TOOL_OR_MODE`
- `MISSING_AUTHORITY`
- `SCOPE_CONFLICT`
- `STALE_PACKET`
- `UNVERIFIED_ASSUMPTION`
- `ENVIRONMENT_BLOCKED`
- `RELIABILITY_LIMIT_REACHED`
- `HUMAN_DECISION_REQUIRED`

Stopping with a clear reason is a protocol success path. It prevents work from
continuing on stale context, missing authority, unverified assumptions, or the
wrong tool mode.

Start with the valid example:
[`stop-response.valid.json`](../schemas/examples/valid/stop-response.valid.json).

### Evidence Set

An Evidence Set links reports, decisions, findings, and evidence items with
provenance and redaction posture. It helps humans and tools inspect what was
known during review.

Start with the valid example:
[`evidence-set.valid.json`](../schemas/examples/valid/evidence-set.valid.json).

### Review Finding

A Review Finding records durable reviewer judgment about a packet, report,
evidence item, or protocol artifact. Findings can identify follow-up risks
without converting reviewer agreement into approval.

Start with the valid example:
[`review-finding.valid.json`](../schemas/examples/valid/review-finding.valid.json).

### Loop Policy

A Loop Policy describes the limits for review/fix or follow-up loops. It can set
a default loop ceiling, breach behavior, breach stop reason, and forbidden
effects that must remain visible across the loop.

Start with the valid example:
[`loop-policy.valid.json`](../schemas/examples/valid/loop-policy.valid.json).

## Authority Vocabulary

The draft base profile uses a small authority vocabulary so recipients know
what they may do:

- `propose_only`: produce proposals, plans, findings, or next steps without
  modifying target surfaces.
- `review_only`: inspect allowed inputs and return findings without applying
  fixes.
- `implement_bounded`: modify only declared allowed surfaces within the packet
  boundary.
- `audit_only`: inspect audit or evidence records and return integrity findings
  without altering underlying work.

Profiles may extend vocabulary only under declared conformance rules. Extensions
must not silently widen authority or hide review obligations.

## Forbidden Effects

Task Packets and Loop Policies can declare forbidden effects. The current draft
examples include:

- `releases_to_users`
- `accepts_risk`
- `bypasses_ship_decision`
- `widens_scope_silently`

Forbidden effects are not permissions. They are boundary markers that tell the
participant and reviewer which outcomes remain outside the approved packet.

## Loop Ceilings

A loop ceiling limits repeated review/fix or follow-up cycles. In the schema
examples, a Task Packet references a Loop Policy with `loop_policy_ref`. The
doctor checks that the referenced policy exists and that simple static policy
compatibility holds:

- packet `loop_ceiling` must not exceed policy `default_loop_ceiling`;
- packet `forbidden_effects[]` must be covered by policy
  `forbidden_effects[]`.

If a loop would exceed the ceiling or policy boundary, the next correct action
is a Stop Response or Human Decision Gate record, not silent continuation.

## Validation Story

HACP has three validation layers in this draft.

### JSON Schemas

The schema pack validates artifact shape and vocabulary:
[`../schemas/`](../schemas/).

Current schemas:

- [`task-packet.schema.json`](../schemas/task-packet.schema.json)
- [`agent-report.schema.json`](../schemas/agent-report.schema.json)
- [`human-decision.schema.json`](../schemas/human-decision.schema.json)
- [`stop-response.schema.json`](../schemas/stop-response.schema.json)
- [`evidence-set.schema.json`](../schemas/evidence-set.schema.json)
- [`review-finding.schema.json`](../schemas/review-finding.schema.json)
- [`loop-policy.schema.json`](../schemas/loop-policy.schema.json)

### Examples And Manifest

Valid examples show accepted contract shapes:
[`../schemas/examples/valid/`](../schemas/examples/valid/).

Invalid examples are intentional contract tests:
[`../schemas/examples/invalid/`](../schemas/examples/invalid/).

The corpus manifest lists expected-valid and expected-invalid artifacts:
[`manifest.json`](../schemas/examples/manifest.json).

### Doctor CLI

Use the local doctor to validate the example corpus:

```bash
npm run hacp:doctor -- schemas/examples/valid
npm run hacp:doctor -- schemas/examples/invalid --json
npm run hacp:doctor -- schemas/examples --json
```

Exit codes:

- `0`: all checked artifacts match expectations.
- `1`: schema, manifest, reference, or policy contract diagnostics were found.
- `2`: input, parse, schema compile, manifest, or environment hard failure.

In manifest mode, the doctor checks expected-valid and expected-invalid fixture
outcomes against the local corpus manifest. Broader reference coherence,
loop-policy binding, loop-policy semantics, and structured repair hints remain
draft conformance goals for later tooling.

The doctor is read-only and non-executing. It validates artifacts and reports
diagnostics only. It does not execute tasks, dispatch packets, call models,
write GitHub, mutate product records, approve work, or perform transport.

## Non-Goals

HACP does not require autonomous execution.
HACP does not define a transport.
HACP does not grant authority by itself.
HACP does not replace human risk acceptance.

HACP does not:

- ship, merge, deploy, release, or accept production risk;
- call models or tools;
- write GitHub;
- certify vendor compatibility;
- require this product's UI, database, tables, routes, or private workflow
  history.

## Start Here

- Public explainer: [`../site/README.md`](../site/README.md)
- Implementer quickstart: [`../quickstart.md`](../quickstart.md)
- Schema pack: [`../schemas/README.md`](../schemas/README.md)
- Example manifest: [`../schemas/examples/manifest.json`](../schemas/examples/manifest.json)
- Draft RFC index: [`../README.md#draft-rfc-index`](../README.md#draft-rfc-index)
- Review packet: [`../docs/review-packet.md`](../docs/review-packet.md)
