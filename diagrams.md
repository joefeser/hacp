# HACP v0.1 Diagrams

These diagrams are non-normative reading aids for the HACP v0.1 working draft.
The RFCs, schemas, base profile declaration, and decision matrix remain the
normative draft artefacts.

## Minimal Lifecycle

This sequence shows the small end-to-end flow used by the minimal example:
packet creation, human approval, manual transport, report import, review
finding, completion, and audit evidence.

```mermaid
sequenceDiagram
  actor HumanOwner
  participant Product
  participant Agent
  participant Reviewer
  participant AuditStore

  HumanOwner->>Product: Create Task Packet draft
  Product->>AuditStore: audit_event packet.created

  HumanOwner->>Product: Human Decision Gate approve_next_packet
  Product->>Product: Set packet_state = approved
  Product->>AuditStore: audit_event packet.approved

  HumanOwner->>Product: Human Decision Gate start_work
  Product->>Product: Set session status = in_progress
  Product->>AuditStore: audit_event decision.recorded

  HumanOwner->>Product: Request render-only manual transport
  Product-->>HumanOwner: Render approved Task Packet
  Product->>AuditStore: audit_event transport.rendered

  HumanOwner->>Agent: Manually paste or upload Task Packet
  Agent->>Agent: Work within allowed_surfaces and authority
  Agent-->>HumanOwner: Return Agent Report and evidence

  HumanOwner->>Product: Import Agent Report
  Product->>AuditStore: audit_event report.imported

  Reviewer->>Product: Record Review Finding
  Product->>AuditStore: audit_event finding.created

  HumanOwner->>Product: Human Decision Gate mark_complete
  Product->>Product: Set session status = completed
  Product->>AuditStore: audit_event session.closed
```

## Authority Boundary

This diagram shows the core HACP invariant: authority comes from the approved
Task Packet and Human Decision Gate records. Transport moves content, and
reports/findings add evidence; they do not create approval.

```mermaid
flowchart TD
  packet["Approved Task Packet"]
  gate["Human Decision Gate"]
  authority["Coordination authority"]
  transport["Transport mechanism"]
  recipient["Agent or tool"]
  report["Agent Report"]
  finding["Review Finding"]
  audit["Audit Trail / Evidence Set"]

  packet --> authority
  gate --> authority
  authority --> recipient

  packet -. "render / copy / upload / queue" .-> transport
  transport -. "moves content only" .-> recipient

  recipient --> report
  report --> finding
  packet --> audit
  gate --> audit
  transport --> audit
  report --> audit
  finding --> audit

  transport -. "MUST NOT widen authority" .-> authority
  report -. "does not approve itself" .-> authority
  finding -. "does not accept risk" .-> authority
```

## Base Decision Matrix

This state diagram mirrors the base Human Decision Gate transition matrix in
[decision-matrix-base-v0.1.yaml](decision-matrix-base-v0.1.yaml). The YAML file
is the canonical machine-readable source.

This block is generated from the YAML matrix. After editing
`decision-matrix-base-v0.1.yaml`, run:

```bash
python3 scripts/generate_decision_matrix_mermaid.py
```

To check for drift without modifying files, run:

```bash
python3 scripts/generate_decision_matrix_mermaid.py --check
```

<!-- BEGIN GENERATED DECISION MATRIX -->
```mermaid
stateDiagram-v2
  [*] --> draft

  draft --> approved: approve_next_packet
  draft --> canceled: cancel_session

  approved --> in_progress: start_work
  approved --> waiting_for_review: request_review
  approved --> needs_human_decision: request_human_decision
  approved --> blocked: mark_blocked
  approved --> canceled: cancel_session

  in_progress --> waiting_for_review: request_review
  in_progress --> needs_human_decision: request_human_decision
  in_progress --> blocked: mark_blocked
  in_progress --> completed: mark_complete
  in_progress --> canceled: cancel_session

  waiting_for_review --> in_progress: accept_follow_up
  waiting_for_review --> approved: approve_next_packet
  waiting_for_review --> needs_human_decision: request_human_decision
  waiting_for_review --> blocked: mark_blocked
  waiting_for_review --> canceled: cancel_session

  needs_human_decision --> in_progress: accept_follow_up
  needs_human_decision --> blocked: mark_blocked
  needs_human_decision --> completed: mark_complete
  needs_human_decision --> canceled: cancel_session

  blocked --> needs_human_decision: request_human_decision
  blocked --> in_progress: accept_follow_up
  blocked --> canceled: cancel_session

  completed --> [*]
  canceled --> [*]
```
<!-- END GENERATED DECISION MATRIX -->

## Core Record Relationships

This is a compact relationship map, not a full schema diagram. It keeps the
record model readable while showing which records constrain or review each
other.

```mermaid
flowchart LR
  profile["Base Profile Declaration"]
  matrix["Decision Matrix"]
  packet["Task Packet"]
  decision["Human Decision Gate"]
  report["Agent Report"]
  finding["Review Finding"]
  audit["Audit Event"]

  profile --> packet
  profile --> report
  profile --> finding
  profile --> decision
  profile --> audit

  matrix --> decision
  decision --> packet
  packet --> report
  report --> finding

  packet --> audit
  decision --> audit
  report --> audit
  finding --> audit
```
