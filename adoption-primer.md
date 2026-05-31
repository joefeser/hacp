# HACP Adoption Primer And Ecosystem Mapping

## Purpose

This primer explains Human-Approved Coordination Protocol (HACP) in enterprise
terms for teams that already use platforms such as GitHub, Azure DevOps, CI/CD
systems, policy engines, and agent tools.

If you need short answers to common objections first, start with the
[FAQ and enterprise objections](site/faq.md).

HACP is a human-approved coordination protocol for accountable agent delegation.
It defines portable task packets, authority boundaries, evidence records, stop
responses, agent reports, and human decision gates.

The current implementation in this repo is a local/product-controlled trial
slice, with controlled-trial evidence centered on PR review and CLI report
decision surfaces.

## What HACP Is Not

HACP is not:

- a model provider
- an IDE
- a source control system
- a CI/CD platform
- an identity provider
- a Microsoft replacement
- a GitHub replacement
- an autonomous deployment system
- an agent runtime

## Non-Goals

HACP in this phase does not automate transport, execution, merge/deploy action,
or cross-system control. It standardizes accountable coordination records only.

## Enterprise Control Model

HACP supports common enterprise controls without replacing existing delivery
systems:

- Governance: delegated work is bounded by an explicit, human-approved packet.
- Controlled work request: packet scope, authority, and forbidden effects are
  explicit before execution starts.
- Evidence of execution: returned reports and audit evidence capture what was
  attempted and what occurred.
- Safe escalation: stop/reject responses provide typed reasons and minimal
  correction paths when work cannot proceed safely.
- Control boundaries: transport and execution are separate from authority.
- Approval records: human decision gates record approve/reject/escalate
  outcomes and rationale.

## Ecosystem Mapping

HACP is designed to sit above or beside existing systems, not replace them.

| Existing ecosystem surface | System remains authoritative for | HACP contribution |
| --- | --- | --- |
| GitHub PRs, checks, and reviews | Code hosting, PR state, review threads, check status | Coordination record contract that can reference delegated work boundaries and returned evidence |
| Azure DevOps work items and pipelines | Work item tracking, pipeline orchestration, release flow | Portable packet/report formats that can be carried alongside existing process records |
| Copilot, Codex, Kiro, and other agent CLIs | Agent runtime behavior and tool interaction | Shared accountability vocabulary for authorized scope, stop reasons, and returned reports |
| CI/CD and policy systems | Build, deploy, gate, policy enforcement | Human decision and evidence records that stay separate from execution systems |

## Relationship Boundaries

- HACP can sit above or beside these tools.
- HACP can produce portable task packets and receive agent reports.
- HACP does not send work to GitHub, Azure DevOps, Microsoft tools, Copilot,
  Codex, Kiro, or other external systems.
- HACP does not run tools, deploy systems, merge pull requests, or replace
  existing platforms.

## Short Scenario

"A human approves a task packet, an agent performs bounded work, returns an
agent report, and the human records a decision."

1. A human approves a packet with explicit scope, authority, and stop
   conditions.
2. An agent performs bounded work within that packet and returns an agent
   report plus evidence.
3. The human reviews evidence and records the next decision at a decision gate.

## See Also

- [README.md](README.md) for the HACP RFC index, invariants, and draft status.
- [site/faq.md](site/faq.md) for common enterprise questions and objections.
- [schemas/README.md](schemas/README.md) for draft schema boundaries and local
  validation tooling.
