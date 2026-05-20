# HACP FAQ And Enterprise Objections

## Working Draft Status

HACP, the Human-Approved Coordination Protocol, is a working draft. It is not a
standard, certification program, agent runtime, transport system, or compliance
framework.

Use this FAQ when the [public site content spine](README.md) is clear enough to
be interesting, but you still need direct answers before reading the
[public spec draft](../spec/README.md).
For role-based pathing across HACP docs, use the
[public navigation pack](navigation.md).

## How To Use This FAQ

Each answer starts with a short answer, then gives a little context. The goal is
to separate HACP records from the tools and systems that may carry or consume
those records.

## Common Questions

### Is HACP an agent runtime?

Short answer: no.

HACP defines coordination records: Task Packets, Agent Reports, Stop Responses,
Evidence Sets, Review Findings, Human Decision Gates, and Loop Policies. It
does not run agents, schedule work, choose models, manage prompts, or provide a
tool execution layer.

Agent runtimes remain responsible for their own behavior. HACP helps a team
record what a human approved, which boundaries applied, what evidence returned,
and what a human decided after review.

### Is HACP a transport protocol?

Short answer: no.

HACP records can be copied, uploaded, attached to tickets, stored in a product,
carried through a queue, or checked by local tooling, but HACP itself is not the
transport layer. Moving a record does not widen the authority declared inside
that record.

Transport and execution systems remain separate from HACP authority records.
The transport can move a packet; it does not approve the work.

### Is HACP a replacement for GitHub, Azure DevOps, Microsoft tools, or CI/CD?

Short answer: no.

Those systems remain authoritative for the jobs they already own: source
control, review threads, check status, ticket state, pipeline execution,
identity, policy, and release flow. HACP adds a portable coordination record
beside those systems so the team can inspect what was approved, what was
returned, why work stopped, and what a human decided.

For enterprise ecosystem framing, read the
[adoption primer](../adoption-primer.md).

### Does HACP let agents approve, merge, deploy, or accept risk?

Short answer: no.

HACP keeps approval and risk acceptance human. Agent output, successful
validation, reviewer agreement, and clean reports remain evidence for review.
They are not approval, completion, merge authority, deploy authority, or risk
acceptance.

The Human Decision Gate is the record that captures the human outcome.

### What does HACP add if we already have pull requests, checks, and tickets?

Short answer: HACP records the delegation contract those systems usually imply
rather than state directly.

Pull requests show code review. Checks show validation status. Tickets show
planning and workflow state. HACP adds the missing coordination layer: what the
human approved the participant to do, which effects were forbidden, what
evidence was expected, when the participant had to stop, and which human
decision followed the returned evidence.

HACP should sit above or beside those systems. It should not replace them.

### What does hacp:doctor prove?

Short answer: it proves local artifacts match the draft schema and corpus rules
that the doctor knows how to check.

The local doctor validates shape, vocabulary, and manifest fixture expectations.
Reference coherence, loop-policy binding, simple loop-policy compatibility, and
structured repair hints are draft conformance goals for later tooling.

Doctor output is evidence for review. It is not approval, certification,
deployment permission, or risk acceptance. Start with the
[schema pack](../schemas/README.md) and the
[implementer quickstart](../quickstart.md).

### How does HACP relate to MCP, tool calling, or agent frameworks?

Short answer: HACP is about authority and evidence, not context exchange or
tool execution.

MCP and tool-calling systems can expose capabilities, context, and actions.
Agent frameworks can decide how an agent plans and calls tools. HACP describes
the human-approved boundary around delegated work and the evidence that comes
back for review.

Those layers can coexist. A tool framework may perform work, while HACP records
what authority was approved and which human decision followed.

### What should a team try first?

Short answer: validate a tiny local packet/report/decision loop.

Start with the [quickstart](../quickstart.md), run the doctor against the valid
and invalid examples, and inspect the [example manifest](../schemas/examples/manifest.json).
Then try writing one Task Packet for a real bounded task and one Agent Report
for the returned evidence. Keep the transport manual until the record shape is
boring and reviewable.

## Enterprise Objections

### "We already have PR reviews and CI."

Short answer: keep them.

HACP is not trying to replace PR reviews or CI. It makes the approved
delegation boundary visible before those systems receive output. The PR can
show the code change, CI can show the validation result, and HACP can show what
the human asked for, what authority was granted, what evidence returned, and
what decision followed.

### "We do not want another agent platform."

Short answer: HACP is not another agent platform.

HACP does not choose models, run prompts, start shells, dispatch work, or
operate a queue. It defines portable records that can be used with the tools a
team already trusts.

### "We need auditability, not more chat."

Short answer: that is the point.

Chat history is helpful context, but it is a weak audit surface. HACP focuses on
durable artifacts: approved packets, returned reports, stops, evidence,
findings, loop policies, and human decisions.

The goal is not a longer conversation. The goal is a record a reviewer can
inspect without reconstructing every message that led to it.

### "We cannot let agents approve work."

Short answer: HACP does not ask you to.

HACP records do not execute work, dispatch packets, call models, write GitHub,
approve outcomes, accept risk, merge, deploy, ship, or contact tools. A report
can request a next step, but the request remains advisory until a human decision
record exists.

## Validation And Doctor Meaning

The doctor is a local, read-only validation command:

```bash
npm run hacp:doctor -- schemas/examples/valid
npm run hacp:doctor -- schemas/examples/invalid --json
npm run hacp:doctor -- schemas/examples --json
```

It checks whether draft artifacts are well-formed enough for review. It does
not contact external systems, run agents, call models, send packets, or approve
anything.

## Relationship To Other Tools And Protocols

HACP can sit beside existing platforms and protocols:

- source control and PR systems remain the source of truth for code review;
- CI/CD remains the source of truth for pipeline execution;
- ticketing systems remain the source of truth for work-item state;
- agent runtimes remain responsible for tool behavior;
- HACP records the approved coordination boundary and review evidence.

For protocol semantics, read the [public spec draft](../spec/README.md). For
the short public explanation, read the [content spine](README.md).

## First Adoption Step

Do not begin with automation. Begin with one manual loop:

1. Write or copy one Task Packet.
2. Validate it with the local doctor.
3. Have a participant return one Agent Report or Stop Response.
4. Record one Human Decision Gate.
5. Inspect whether the record was clear enough for someone else to review.

If that loop is not clear manually, automation will make the confusion faster.

## Next Reading

- [Public site content spine](README.md)
- [HACP entry point](../README.md)
- [Public spec draft](../spec/README.md)
- [Adoption primer](../adoption-primer.md)
- [Schema pack](../schemas/README.md)
- [Implementer quickstart](../quickstart.md)
