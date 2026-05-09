# RFC-0000: Motivation and Scope

Status: Draft

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

The Human-Approved Coordination Protocol (HACP) defines contracts for
accountable delegation among humans, agents, and tools. Its purpose is to let a
human owner approve bounded work once, route that work through one or more agent
or tool contexts, and receive evidence back without turning the human into the
manual router for every intermediate message.

HACP is not an autonomous-agent framework. It is a coordination protocol for
work whose authority remains human-approved.

## Motivation

Modern engineering work increasingly involves multiple AI tools, review bots,
local CLIs, hosted assistants, and human reviewers. These tools can produce good
work, but the handoffs are often informal: a copied prompt, a pasted review, a
tool-specific instruction header, or a human memory of what the agent was
allowed to touch.

That informality creates recurring failures:

- an agent treats a review as permission to widen scope;
- a tool transports a task and accidentally appears to grant authority;
- a reviewer invents new vocabulary or states that the product does not support;
- a loop continues because every reviewer can find one more reason to remain
  involved;
- evidence exists but cannot be traced back to the approval that authorised it.

HACP addresses those failures by making the delegation contract explicit. A task
packet states the work, authority, scope, stop conditions, and required report.
Human decision gates record authority changes. Reports and findings return
evidence in a shape both humans and machines can inspect. Transport remains
separate from authority.

## Design Goals

HACP aims to provide:

1. A human-readable packet contract that tools can also validate.
2. A minimum authority vocabulary that excludes human-only decisions such as
   shipping, risk acceptance, and silent scope widening.
3. A decision-gate model where authority changes are explicit, recorded, and
   attributable to a human actor in the base profile.
4. A report and finding model that makes review outcomes and residual risk
   durable.
5. A loop ceiling for bounded iteration.
6. An audit and evidence model that supports independent review.
7. A transport boundary that lets products integrate CLIs, file watchers, or
   hosted tools without converting transport into authority.

## Non-Goals

HACP does not define:

- model-to-model context exchange;
- tool invocation protocols;
- prompt syntax for a particular vendor;
- an in-app shell;
- a direct model API orchestration layer;
- service-bus execution;
- outbound notification fan-out;
- autonomous shipping;
- authority values such as `ship` or `accept_risk`;
- standing approval, delegated approval, or template-based pre-approval;
- agent identity, agent authentication, or agent capability discovery.

HACP can coexist with protocols that handle model context or tool calls. It is
concerned with accountability, authority, routing, and evidence.

## Normative Language

Draft RFCs use the keywords `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and
`MAY` in their ordinary RFC sense.

## Protocol Model

The minimum HACP lifecycle has six record types:

1. **Task Packet** — the approved work contract.
2. **Authority Vocabulary** — the closed or profiled set of permitted authority
   values.
3. **Agent Report** — the returned account of work, verification, blockers, and
   residual risk.
4. **Review Finding** — a severity and classification attached to a packet or
   report.
5. **Human Decision Gate** — an explicit human decision that changes
   status, routing, authority, or closeout.
6. **Audit Evidence Set** — the durable record proving what happened.

Loop ceilings and transport-boundary rules are cross-cutting contracts rather
than optional workflow decoration.

## Core Invariants

### Human Authority Is Explicit

An HACP implementation MUST distinguish the ability to perform work from the
authority to approve direction, authority, risk, or ship/no-ship outcomes.

An HACP implementation MUST NOT treat agent completion, review agreement, or
transport success as implicit human approval.

### Authority Comes From The Packet

The task packet is the source of delegated authority. Transport mechanisms,
reviewer labels, queue names, CLI commands, watched directories, or model
choices MUST NOT widen or reinterpret the authority granted by the packet.

If a transport mechanism cannot execute within the packet's authority, it MUST
stop or return a blocker. It MUST NOT silently rewrite the packet into a smaller
or broader authority claim.

### Human-Only Authority Cannot Be Profiled Back In

A conforming authority vocabulary MUST NOT include any value whose effect is to
release software to users, accept known risk on behalf of users, bypass a human
ship/no-ship decision, or silently widen scope.

The test is the effect, not the label. Profile values such as
`deploy_to_production`, `merge_to_main`, `accept_exception`, or equivalent
release/risk decisions are non-conforming if they let an agent or automated
system perform human-only authority.

### No Standing Approval In The Base Profile

The base HACP profile does not define delegated approval, standing approval, or
template-based pre-approval. A Human Decision Gate requires a human actor to act
on a specific packet instance, not merely on a class of future packets.

Any future delegated-approval profile MUST define how delegation is scoped,
time-bounded, revocable, audited, and tied back to a human owner. Until that
profile exists, service accounts, CI jobs, and unattended watchers MUST NOT be
treated as human actors.

### No Silent Vocabulary Widening

Closed vocabularies MUST NOT be extended silently. Profiles MAY add vocabulary
values only when the profile declares the extension, preserves the required HACP
invariants, and remains mechanically distinguishable from the base vocabulary.

All HACP records MUST carry profile identifiers and profile versions that let
consumers determine which vocabulary and schema version applies. Profile
extensions are conforming only when they satisfy RFC-0009 and preserve the
invariants in this document.

### Evidence Is Part Of The Contract

Reports, findings, decisions, and audit records are not secondary logs. They are
part of the coordination contract and MUST be inspectable after the fact.

At minimum, a Human Decision Gate record needs a timestamp, actor, decision
value, target packet or session, from/to status where applicable, and rationale.
RFC-0005 will define the full shape.

## Relationship To Existing Work

HACP is adjacent to, but distinct from, protocols that focus on context exchange,
tool calling, or agent-to-agent messaging. HACP's centre of gravity is
accountable delegation: who approved the work, what authority was granted, what
the agent did, what evidence returned, and where human judgement was required.

MCP and similar protocols define how a model or agent discovers and invokes
tools. HACP defines the authority contract: what may be done, by whom, under
which constraints, and what evidence must return. An HACP packet may be
transported through an MCP tool call, CLI invocation, queue message, or file
watcher, but that transport schema does not become the source of authority.

Agent-to-agent protocols can describe message exchange between agents. HACP
describes the accountable delegation boundary around that exchange.

## Versioning

HACP draft documents use numbered RFC files. Backwards-incompatible changes
SHOULD be introduced through a new draft revision or a profile with explicit
conformance rules.

The initial draft favours Markdown as the human-readable canonical form, with
JSON Schema or equivalent machine-readable schemas as companion artefacts.

## Open Questions

- What is the minimum viable Task Packet field set?
- Which authority values belong in the base profile versus optional profiles?
- Should conformance require both Markdown and JSON renderings?
- How should independent implementations prove the transport-boundary invariant?
- Which audit evidence is mandatory for a minimal implementation?
- Which currently optional behaviours should become v0.1 blockers versus
  post-v0.1 extensions?
