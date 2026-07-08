# WITS v0 HACP Source Packet

Status: public-safe source packet.

Source issue: <https://github.com/joefeser/hacp/issues/39>

Source material:

- WITS operating memory snapshot dated 2026-07-07;
- WITS PR #1107, "Promote HACP/WITS v0 product path to main";
- WITS PR #1113, "Define HACP-ready discipline packet bundle contract";
- current HACP RFCs, schemas, CLI bridge candidate docs, and transport
  boundary docs in this repository.

This packet translates private/reference implementation learning into HACP
protocol source material. It does not import WITS runtime orchestration into
HACP core.

## Purpose

WITS v0 proved that human-approved work can be shaped as bounded packets,
returned reports, review evidence, stop reasons, and human decision gates. It
also proved that transport paths such as CLI, HTTP report return, and RabbitMQ
custody envelopes need explicit authority boundaries so they do not become
hidden execution or approval channels.

This packet gives public implementers a compact map of those protocol concepts
without requiring access to private chat history or product-specific runtime
details.

## Non-Goals

This packet does not add:

- runtime orchestration;
- hosted execution;
- model or tool dispatch;
- GitHub mutation;
- billing;
- worker launch authority;
- HACP.io hosted-control-plane claims;
- production-readiness or conformance-complete claims.

HACP remains a protocol, schema, example, conformance, and doctrine surface.

## Proven Protocol Concepts

WITS v0 is useful to HACP because it exercised these separable concepts:

| Concept | Protocol lesson | Current HACP home |
| --- | --- | --- |
| Task packet | Authority starts in a bounded, human-approved packet with source context and forbidden effects. | [RFC-0001](../../rfcs/0001-task-packet.md), [schemas/task-packet.schema.json](../../schemas/task-packet.schema.json) |
| Approved packet readback | Approval must be explicit, reviewable, and bound to the packet content being transported. | [RFC-0001](../../rfcs/0001-task-packet.md), [RFC-0008](../../rfcs/0008-transport-boundary.md) |
| Agent report | Returned work is evidence for review, not approval or completion. | [RFC-0003](../../rfcs/0003-agent-report.md), [schemas/agent-report.schema.json](../../schemas/agent-report.schema.json) |
| Human decision gate | Consequential state changes require an explicit human decision record. | [RFC-0005](../../rfcs/0005-human-decision-gate.md), [schemas/human-decision.schema.json](../../schemas/human-decision.schema.json) |
| Review finding | Review output must remain tied to severity, evidence, and requested disposition. | [RFC-0004](../../rfcs/0004-review-finding.md), [schemas/review-finding.schema.json](../../schemas/review-finding.schema.json) |
| Evidence set | Evidence needs refs, summaries, check output, custody/readback, and digest-domain awareness. | [RFC-0007](../../rfcs/0007-audit-trail-and-evidence-set.md), [schemas/evidence-set.schema.json](../../schemas/evidence-set.schema.json) |
| Loop ceiling | Repeated review/fix cycles need visible ceilings and fail-closed breach behavior. | [RFC-0006](../../rfcs/0006-loop-ceiling-and-bounded-iteration.md), [schemas/loop-policy.schema.json](../../schemas/loop-policy.schema.json) |
| Stop reason | Stops are valid protocol outcomes and should name the mismatch plus minimal correction. | [stop-response schema](../../schemas/stop-response.schema.json), [diagnostics and stop reasons](../cli-bridge-contract/v0/diagnostics-and-stop-reasons.md) |
| Transport envelope | Transport moves records but must not widen authority. | [RFC-0008](../../rfcs/0008-transport-boundary.md), [adapters and projections](../adapters-and-projections.md) |
| Profiles and conformance | Extensions need named profiles, forbidden-effect mappings, and evidence. | [RFC-0009](../../rfcs/0009-conformance-and-profiles.md), [profiles](../profiles.md) |

## Source Packet Shape

A public-safe WITS-derived source packet can be represented as a non-executing
bundle:

```text
source-packet.json
task-packet.candidate.json
agent-report.candidate.json
human-decision-gate.candidate.json
review-finding.candidate.json
evidence-set.candidate.json
loop-policy.candidate.json
stop-response.candidate.json
transport-envelope.candidate.json
conformance-candidates.md
```

The bundle is source material. It is not a dispatcher, queue consumer, worker
launcher, product import path, hosted shell, or approval engine.

## Task Packets

The WITS source shape reinforces the existing HACP task-packet rule:

- preserve the original human request and acceptance criteria;
- name the approved scope and denied scope;
- include source refs and prior send-back notes when relevant;
- declare expected evidence and stop conditions;
- declare approved profile refs when an adapter or tool path is involved;
- include forbidden effects such as runtime execution by HACP, model/tool
  dispatch by HACP, GitHub mutation by HACP, hidden worker launch, and billing
  actions.

A task packet can authorize bounded work for an external participant. It does
not authorize HACP core to run the participant.

## Approved Packet Readback

WITS v0 distinguishes a packet-shaped request from an approved packet. Public
HACP source material should preserve that distinction by carrying:

- approval actor or accountable authority reference;
- approval timestamp or decision ref;
- packet digest, canonical digest, or equivalent content binding;
- profile id/version when the approved packet relies on a profile;
- explicit denied authority and forbidden effects;
- transport boundary metadata when the packet leaves the owner surface.

Approved packet readback is evidence that a human-approved packet exists and
that the transported content claims to match it. It is not evidence that work
completed, that a report should be accepted, or that a later transport may keep
running without another human decision.

## Agent Reports

The source report shape should preserve:

- the packet id and any profile proof it claims to answer;
- attempted work summary;
- evidence refs and output bundle refs;
- diagnostics and stop reasons;
- residual risks and unproven claims;
- requested next human decision;
- boundary attestations that the report is evidence only.

The report-return concept is the core lesson: a worker, runner, reviewer,
adapter, or owner-controlled tool returns evidence to HACP-shaped review. The
return path can be CLI, HTTP, file, queue, or manual carry, but the path does
not approve the report.

## Human Decision Gates

WITS v0 keeps human decisions explicit. A public source packet should model at
least these decision outcomes:

- approve a bounded next step;
- hold for more evidence;
- reject a report;
- revise the packet;
- send back with notes;
- stop or cancel the chain.

A human decision gate should name the packet/report/evidence it reviewed, the
decision made, preserved source context, and any denied authority. It should not
silently start another loop.

## Review Findings

Review findings should carry:

- severity;
- finding summary;
- evidence refs;
- affected surfaces;
- recommended disposition;
- residual risk;
- whether human decision is required before the next step.

Findings are evidence. They are not patch authority, merge authority, acceptance
authority, or risk acceptance.

## Evidence Sets

Evidence sets should be readable by humans and checkable by tools. Candidate
source evidence includes:

- source packet and profile refs;
- command or checker readback when the owner system ran one;
- returned report digests and digest-domain labels;
- review findings;
- transport receipt or custody readback;
- import verification summaries;
- human decision refs.

Evidence should avoid private local paths, secrets, bearer material, internal
hostnames, and product-only IDs unless a profile says how to redact them.

## Loop Ceilings

The source packet should keep loops bounded:

- include a visible ceiling when review/fix iteration is allowed;
- count only profile-defined attempts or cycles;
- route ceiling breach to a stop response or human decision;
- forbid automated reset, bypass, or ceiling expansion;
- preserve residual risk when the loop stops.

This preserves the WITS lesson that review automation can help without turning
the human into an implicit state machine.

## Stop Reasons

Candidate WITS-derived stop reasons should map to HACP canonical stop response
vocabulary before they are accepted as base-profile fixtures.

Useful candidates include:

| Candidate reason | Meaning | Candidate canonical mapping |
| --- | --- | --- |
| `STALE_PACKET` | Packet, report, profile, or expected digest no longer matches current evidence. | `stale_packet` |
| `CONTEXT_MISMATCH` | Work landed in the wrong repo, branch, tool, mode, or source context. | `context_mismatch` |
| `HUMAN_DECISION_REQUIRED` | Next step changes authority, scope, risk, persistence, or acceptance. | `missing_authority` or profile-specific decision-required stop |
| `ENVIRONMENT_BLOCKED` | Required local runtime, token/session, dependency, or toolchain is unavailable. | `environment_blocked` |
| `RELIABILITY_LIMIT_REACHED` | Continuing would require guessing beyond available evidence. | `reliability_boundary` |
| `MISSING_AUTHORITY` | Required packet/profile/human decision evidence is absent. | `missing_authority` |
| `WRONG_TOOL_OR_MODE` | Requested tool, command, mode, or adapter path differs from approved boundary. | `wrong_tool_or_mode` |
| `SCOPE_CONFLICT` | Requested work conflicts with allowed scope or forbidden effects. | `scope_conflict` |
| `UNVERIFIED_ASSUMPTION` | A required claim is not supported by reviewable evidence. | `unverified_assumption` |

Profile-specific stop codes may be richer, but base consumers need a stable
mapping and minimal correction.

## CLI And HTTP Report Return

CLI and HTTP report-return paths are transport/readback contracts:

1. The owner system approves a bounded task packet.
2. A participant receives or is given the packet through a declared transport.
3. The participant returns an agent report with evidence and proof refs.
4. A verifier/importer checks custody and shape.
5. The result is routed to a human decision gate.

The CLI/HTTP path must preserve:

- packet id and digest or equivalent proof;
- profile id/version when profile trust is claimed;
- report id and report digest or equivalent proof;
- diagnostics and stop reasons;
- evidence-only boundary statements;
- no hidden execution or approval by import.

The public CLI bridge candidate already captures this posture in
[docs/cli-bridge-contract/v0](../cli-bridge-contract/v0/README.md). HTTP
report return should use the same conceptual boundary unless a future profile
publishes additional requirements.

## RabbitMQ Transport Envelope Posture

RabbitMQ is source material for a transport envelope, not a HACP core
requirement.

A RabbitMQ-style envelope may be useful for custody evidence when it records:

- envelope id;
- packet/report reference;
- transport profile id and version;
- producer and consumer identities or stable role labels;
- published/claimed/acked timestamps;
- retry or dead-letter posture;
- payload digest or detached proof;
- custody receipt refs;
- boundary assertions that transport success is not approval or completion.

A RabbitMQ transport profile must not claim base HACP conformance unless it
publishes its profile, integrity checks, approval verification, audit contract,
replay behavior, and failure semantics under RFC-0008 and RFC-0009.

HACP does not require RabbitMQ, does not replace RabbitMQ, and does not treat a
queue ack as work completion.

## HACP-Ready Discipline Packet Bundle

WITS PR #1113 introduced a useful upstream packet-bundle pattern:

```text
manifest.json
canonical-app-truth.json
owner-decisions.json
dependency-matrix.json
integration-contract.json
evidence-index.json
discipline-packets/
prompts/
```

The protocol lesson is broader than the product source:

- one owner-approved truth record should be the spine;
- derived packets may guide UI/UX, roles/security, data, workflow,
  integrations, QA, and deployment planning;
- derived packets must not redefine canonical truth;
- JSON records are authority-bearing source material;
- Markdown prompts are helper surfaces only;
- contradictions, missing dependencies, and unsafe authority requests stop for
  owner decision.

For HACP, this suggests future fixture candidates for source-context packets,
dependency matrices, integration gates, and contradiction stops. It does not add
prompt orchestration or model dispatch to HACP core.

## Conformance Fixture Candidates

These candidates are useful next fixtures, but they are not stable conformance
vectors yet:

| Candidate fixture | Expected outcome | Boundary tested |
| --- | --- | --- |
| `wits-task-packet-with-source-context.valid.json` | valid | Original request, source refs, allowed scope, denied effects, expected evidence. |
| `wits-agent-report-with-profile-proof.valid.json` | valid | Report binds to packet/profile proof and remains evidence only. |
| `wits-human-decision-send-back.valid.json` | valid | Human sends report back without auto-rerun or hidden dispatch. |
| `wits-review-finding-residual-risk.valid.json` | valid | Finding carries severity, evidence, residual risk, and requested disposition. |
| `wits-evidence-set-import-custody.valid.json` | valid | Evidence refs, report digest, custody receipt, and import summary are reviewable. |
| `wits-loop-policy-ceiling-breach.valid.json` | valid | Loop ceiling breach routes to human decision or terminal stop. |
| `wits-stop-response-context-mismatch.valid.json` | valid | Context mismatch fails closed with minimal correction. |
| `wits-transport-envelope-rabbitmq-custody.valid.json` | valid under transport profile | Queue custody envelope is evidence only and cites profile. |
| `wits-discipline-packet-redefines-truth.invalid.json` | invalid | Derived packet attempts to rewrite canonical owner-approved truth. |
| `wits-report-import-claims-completion.invalid.json` | invalid | Import verification claims completion or approval without human decision. |
| `wits-transport-ack-claims-approval.invalid.json` | invalid | Queue ack is treated as human approval. |
| `wits-hidden-worker-launch.invalid.json` | invalid | Packet or transport envelope grants worker launch authority. |

When promoted, these should use placeholder public refs, deterministic digest
domains, and no secrets or private paths.

## Public-Safe Redaction Rules

Public source material should replace:

- private repo paths with `repo://example/...`;
- private hostnames with `example.invalid` or `example.test`;
- credentials, tokens, cookies, and session IDs with omitted fields rather than
  redacted-looking values;
- human chat excerpts with summarized source context;
- product-specific runtime ids with stable public role labels.

The public packet may cite public issues, PR numbers, and repository-relative
docs when they are intended as provenance.

## Promotion Path

This packet should feed future work in this order:

1. choose the fixture candidates that belong in the base draft versus a named
   transport/profile extension;
2. add public-safe JSON examples with placeholder digest domains;
3. add schema or doctor checks only after the examples have stable semantics;
4. update RFC-0008/RFC-0009 if automated transport profile requirements become
   more precise;
5. keep HACP.io product positioning separate from protocol conformance.

The source packet is complete when public implementers can understand the WITS
lessons as protocol concepts without importing WITS private runtime machinery.
