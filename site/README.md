# HACP Public Site Content Spine

## Working Draft Status

HACP, the Human-Approved Coordination Protocol, is a working draft for teams
that want useful AI assistance without losing sight of human approval,
authority boundaries, evidence, and follow-up decisions.

This page is the plain-language content spine for public HACP explanation. For
the protocol-level draft, read the [public spec draft](../spec/README.md).
For role-based "where do I start?" routing, use the
[public navigation pack](navigation.md).

## Hero Summary

HACP records the handoff between a human, an agent or tool, and the next human
decision. It gives teams a shared way to say what was approved, what authority
was granted, what evidence came back, why work stopped when it could not safely
continue, and what a human decided after review.

The goal is not more autonomy by default. The goal is visible coordination:
bounded delegation, reviewable evidence, explicit stops, and human decisions
that remain separate from agent output.

## What Is HACP?

HACP is a draft protocol for human-approved coordination across AI-assisted
workflows. It defines portable records for the parts of a handoff that usually
get blurred:

- the human-approved request;
- the authority and limits attached to that request;
- the report or stop response returned by the participant;
- the evidence and review findings available to the owner;
- the human decision that accepts, revises, blocks, or continues the work.

HACP helps a team review the coordination record without needing to trust chat
history, hidden tool state, or a vendor-specific dashboard as the only source
of truth.

## Why Human-Approved Coordination Matters

AI agents and tools can draft, inspect, transform, call other tools, and prepare
work for review. In many teams, the risky part is not that tools can help. The
risky part is losing track of which human approved what, what authority the
tool actually had, which evidence was visible, and whether the next step was a
real human decision or just workflow momentum.

HACP helps reduce three common failure modes:

- fake confidence, where a clean-looking report sounds like approval;
- hidden autonomy, where transport or tooling quietly widens authority;
- messy handoffs, where the next reviewer cannot tell what was requested,
  returned, stopped, or decided.

## Core Loop In Plain English

1. Human approves packet.
2. Agent or tool acts within the approved authority, or stops.
3. Report or Stop Response returns with evidence.
4. Human Decision Gate records acceptance, follow-up, revision, block, or other
   explicit outcome.
5. Optional follow-up loop continues only inside the approved Loop Policy.

Reports, stops, evidence, findings, and validation results are advisory until a
human decision record exists. A successful report is not approval. A clean
validation run is not approval. A Review Finding is not risk acceptance.

## Who HACP Is For

### Enterprise AI Teams

Use HACP to make agent-assisted work reviewable before it reaches sensitive
systems, customers, production change paths, or formal sign-off workflows.

### Agent Framework Builders

Use HACP to expose common handoff records without owning every downstream
approval process or enterprise control surface.

### Compliance And Audit Reviewers

Use HACP records to inspect what was approved, what evidence returned, what was
stopped, and what a human decided.

### Internal Tools Teams

Use HACP to connect agent output to existing review, ticketing, change
management, and evidence workflows while keeping human approval explicit.

## Artifact Model Overview

### Task Packet

The human-approved work boundary. It declares scope, authority, allowed tools,
forbidden effects, stop conditions, verification requirements, evidence
expectations, and loop policy.

### Agent Report

The returned evidence after bounded work. It records what happened, what was
verified, what risks remain, and what next human decision is requested.

### Human Decision Gate

The explicit human decision record. It is where review becomes acceptance,
follow-up, revision, block, or another recorded outcome.

### Stop Response

The valid response when the participant cannot safely continue. It records what
does not line up, why stopping is correct, and what minimal correction would
unblock the work.

### Evidence Set

The linked evidence record. It helps reviewers see which artifacts, findings,
reports, and decisions were available during review.

### Review Finding

The durable reviewer observation. It can identify risk, missing evidence, or a
boundary issue without turning that observation into approval.

### Loop Policy

The limit on repeated follow-up cycles. It keeps repair, review, or continuation
inside an approved ceiling instead of drifting into open-ended work.

## Quickstart Path

Start here if you are evaluating HACP:

1. Read the [public spec draft](../spec/README.md) for protocol semantics.
2. Use the [FAQ and enterprise objections](faq.md) when you need direct answers
   before the protocol details.
3. Run the [implementer quickstart](../quickstart.md) for the smallest local
   validation loop.
4. Review the [schema pack](../schemas/README.md) for artifact shapes.
5. Inspect the [example manifest](../schemas/examples/manifest.json) to see
   valid and invalid fixture expectations.

## Doctor CLI And Validation Story

The local `hacp:doctor` command checks draft HACP artifacts against the schema
pack and example corpus expectations.

```bash
npm run hacp:doctor -- schemas/examples/valid
npm run hacp:doctor -- schemas/examples/invalid --json
npm run hacp:doctor -- schemas/examples --json
```

The doctor validates shape, vocabulary, and manifest fixture expectations.
Reference coherence, loop-policy binding, simple loop-policy compatibility, and
structured repair hints are draft conformance goals for later tooling.

The doctor is read-only and non-executing. It validates artifacts and reports
diagnostics only. It does not execute work, dispatch packets, call models,
write GitHub, approve outcomes, accept risk, or perform transport.

Validation is evidence for review. It is not a human decision.

## Authority Boundaries

HACP keeps authority visible by making the Task Packet the approved boundary
and the Human Decision Gate the recorded decision. Authority does not come from
the channel that moved the record, the tool that read it, or the fact that a
report was produced.

The core authority boundary is simple: protocol records can declare approved
scope, requested authority, evidence, stops, and decisions, but they do not
perform work by themselves.

## Not This

HACP is not an agent runtime.
HACP is not a transport protocol.
HACP is not a replacement for human approval.
HACP does not grant tools authority by itself.

HACP also does not ship, merge, deploy, release, accept production risk, certify
vendor compatibility, or require a specific product UI.

## Relationship To The Public Spec Draft

This content spine is the short public explanation. It is meant for people who
need the value, loop, artifacts, validation story, and boundaries before reading
the full protocol draft.

The [public spec draft](../spec/README.md) remains the authoritative protocol
entry point for artifact semantics, stop reasons, authority vocabulary,
forbidden effects, loop ceilings, schema links, and doctor expectations.
