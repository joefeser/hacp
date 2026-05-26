# HACP Authority Boundaries

HACP keeps authority explicit and human-issued. The protocol records custody and
decisions; it does not replace approval authority.

## Mandatory Boundary Statements

- Approval is explicit and human-issued.
- Report verification confirms custody/integrity checks, not completion.
- File and CLI transports move artifacts but do not grant authority.
- Human decision remains required for risky transitions.

## What Authority Is Not

- File arrival is not approval.
- Report presence is not completion proof.
- Verification does not replace human decision.
- Adapter usage does not transfer authority.

## Control-Plane Posture

HACP is transport-neutral. It can be carried through multiple adapters while
keeping the same authority contracts:

- `TaskPacket` defines bounded intent and constraints.
- `AgentReport` and `EvidenceSet` provide reviewable claims.
- `HumanDecision` records approval/rejection/defer outcomes.
- `StopReason` records why continuation halted.
- `AuditEvent` and `Receipt` preserve custody traceability.
