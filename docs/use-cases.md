# HACP Use Cases

Status: non-normative explanatory material.

This page explains why HACP exists before introducing protocol details. It is
not a conformance target, schema extension, runtime requirement, or prompt
standard.

HACP is useful when agents, tools, or humans can do bounded work, but a
consequential next step still needs explicit human approval. The core idea is
simple:

> Reports are evidence, not authorization.

An adapter may compare data, draft a recommendation, verify a change, or request
a next step. HACP records the approved work boundary, the returned evidence, the
match between report and authority, and the human decision. It does not make the
decision for the human.

## Common Pattern

Most HACP workflows follow the same shape:

1. A human approves a bounded work packet.
2. The packet is carried to an agent, tool, adapter, or human workflow
   participant.
3. The participant returns structured evidence.
4. The returned work is matched to the approved packet.
5. A human records the decision to accept, reject, revise, escalate, continue,
   or stop.

The examples below map ordinary workflow language to HACP 0.2 records. They do
not require a specific model, queue, database, user interface, prompt format, or
transport mechanism.

## Product Listing Verification

A product team needs to verify that UPCs, vendor specifications, ordered
quantities, marketplace attributes, and listing data match before a product goes
live or an order proceeds.

An agent or tool can compare the data and return matches, mismatches, missing
fields, confidence notes, and residual risk. A human reviewer still decides
whether to approve the listing, request correction, reject the report, or
escalate the issue.

| HACP concept | Product verification example |
| --- | --- |
| Authority packet | "Verify these SKUs against purchase order, UPC, vendor specs, and marketplace listing requirements." |
| Handoff package | The approved work boundary is made available to a product-verification adapter. |
| Adapter report | The adapter returns matched fields, mismatches, evidence, unresolved risks, and an advisory requested next step. |
| Match proof | The owner system proves the report belongs to the exact approved SKU batch and handoff. |
| Human decision record | A product team member approves, rejects, requests revision, or escalates. |
| Consequential state change | Only after approval does the product move toward listing, order approval, synchronization, or another downstream business state. |

HACP is useful here because one human can review evidence and exceptions instead
of manually rechecking every field from scratch, while the product still does
not move forward without a recorded human decision.

## Executive Routing Gate

Some work can be prepared by an agent, employee, or assistant, but routing it to
an executive or high-value reviewer should not be automatic. The organization
may need a human gate before the request consumes attention, changes priority,
or carries authority.

| HACP concept | Executive routing example |
| --- | --- |
| Authority packet | "Prepare a concise routing packet for this issue, limited to these facts and requested decision options." |
| Handoff package | The approved packet is carried to a summarization or triage participant. |
| Adapter report | The participant returns the proposed summary, routing reason, risk notes, and requested next step. |
| Match proof | The owner system links the summary back to the exact approved packet. |
| Human decision record | A human approves routing, rejects it, redirects it, or asks for more information. |
| Consequential state change | Only after approval does the workflow route the work to the executive or change its escalation posture. |

HACP is useful here because the preparation work can be assisted, while the
attention-routing decision remains explicit and reviewable.

## Assistant Task Queue

An assistant may manage a queue of tasks where some work is handled by people,
some by tools, and some by AI. The queue may include due dates, priority, risk,
evidence, review conditions, and handoffs between participants.

| HACP concept | Assistant queue example |
| --- | --- |
| Authority packet | "Review this task, gather the requested evidence, and stay within these boundaries." |
| Handoff package | The approved task boundary is made available to the next participant. |
| Adapter report | The participant returns findings, status, blockers, residual risks, and a requested next step. |
| Match proof | The owner system proves the report belongs to the approved task and handoff. |
| Human decision record | The assistant or owner marks complete, requests revision, cancels, escalates, or continues. |
| Consequential state change | Only after approval does the task become complete, escalate, change ownership, or move to another review posture. |

HACP is useful here because AI can complete bounded work inside the queue, but
the human remains the decision gate for completion, escalation, and authority
changes.

## Marketing Or Competitive Analysis

An agent can gather competitor research, summarize changes, draft options, and
recommend follow-up actions. Those outputs may be useful, but they should not by
themselves publish content, contact customers, email vendors, or change a live
asset.

| HACP concept | Marketing or research example |
| --- | --- |
| Authority packet | "Analyze these competitors and identify notable changes; do not contact anyone or change live assets." |
| Handoff package | The approved research boundary is carried to a research adapter. |
| Adapter report | The adapter returns evidence, sources, summary, risks, and advisory recommendations. |
| Match proof | The owner system links the report to the exact approved research request. |
| Human decision record | A human accepts follow-up, requests revision, rejects the report, or marks the work complete. |
| Consequential state change | Only after approval does a separate workflow proceed toward outreach, publishing, campaign changes, or business-record updates. |

HACP is useful here because research and recommendation can scale without
turning recommendations into automatic action.

## Software Review And Change Gates

An agent can review a pull request, inspect tests, summarize risks, or propose a
bounded fix. The report can help a developer decide what to do next, but it
should not silently widen authority or approve a consequential change by itself.

| HACP concept | Software review example |
| --- | --- |
| Authority packet | "Review this change for the listed risks and propose bounded fixes; do not modify unrelated areas." |
| Handoff package | The approved review boundary is carried to a reviewer, tool, or agent. |
| Adapter report | The participant returns findings, evidence, suggested fixes, verification notes, and residual risks. |
| Match proof | The owner system links the report to the exact approved review request. |
| Human decision record | A human accepts follow-up, requests revision, rejects the report, or marks review complete. |
| Consequential state change | Only after approval does a separate implementation, merge, release, or follow-up workflow proceed. |

HACP is useful here because agents can help with review and remediation while
the human still owns scope, risk acceptance, and ship/no-ship decisions.

## What These Examples Do Not Mean

These examples do not mean HACP itself:

- runs tools, shells, CLIs, or verification commands;
- calls models or defines prompt formats;
- sends emails, routes messages, publishes listings, ships orders, merges code,
  deploys software, or changes live records;
- replaces the human decision gate;
- requires a specific product UI, message bus, database, or automation stack.

HACP defines custody and approval records around bounded work. Profiles and
implementations may define how records are carried, displayed, verified, and
stored, but the base protocol keeps reports as evidence and consequential next
steps under explicit human approval.
