#!/usr/bin/env python3
"""Sketch a HACP audit-event adapter shape for PyRapide.

This file is intentionally dependency-free. It mirrors the event shape HACP
would likely hand to PyRapide: event name, source, payload, and causal
predecessors. A real adapter can replace CausalEvent with PyRapide Event /
Computation primitives while keeping the mapping and constraints.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_AUDIT = ROOT / "examples" / "minimal-v0.1" / "audit.jsonl"
DEFAULT_MAPPING = ROOT / "examples" / "integrations" / "pyrapide" / "hacp-events.jsonl"


class AdapterConstraintError(ValueError):
    """Raised when HACP audit events cannot form the expected causal graph."""


@dataclass(frozen=True)
class CausalEvent:
    """Small stand-in for a PyRapide-style immutable event."""

    event_id: str
    name: str
    source: str
    payload: dict[str, Any]
    audit_record: dict[str, Any]
    caused_by: tuple[str, ...] = field(default_factory=tuple)


def load_audit_events(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def load_event_mapping(path: Path) -> dict[tuple[str, str | None], dict[str, Any]]:
    mapping: dict[tuple[str, str | None], dict[str, Any]] = {}
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        key = (row["hacp_event"], row.get("decision"))
        mapping[key] = row
    return mapping


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AdapterConstraintError(message)


def require_key(mapping: dict[str, Any], key: str, context: str) -> Any:
    value = mapping.get(key)
    require(value is not None, f"{context} requires predecessor {key!r}")
    return value


def require_event(events: dict[str, list[CausalEvent]], name: str) -> CausalEvent:
    matches = events.get(name, [])
    require(bool(matches), f"Audit log must contain at least one {name} event")
    return matches[0]


def event_name(
    audit_event: dict[str, Any],
    event_mapping: dict[tuple[str, str | None], dict[str, Any]],
) -> str:
    event_type = audit_event["event_type"]
    decision = None
    if event_type == "decision.recorded":
        decision = audit_event.get("payload", {}).get("decision")
        require(decision is not None, f"{audit_event['audit_id']} missing payload.decision")

    mapping = event_mapping.get((event_type, decision)) or event_mapping.get((event_type, None))
    require(
        mapping is not None,
        f"{audit_event['audit_id']} has no mapping for event_type={event_type!r}, decision={decision!r}",
    )
    return mapping["pyrapide_event"]


def build_causal_events(
    audit_events: list[dict[str, Any]],
    event_mapping: dict[tuple[str, str | None], dict[str, Any]],
) -> list[CausalEvent]:
    """Map HACP audit events into a causal chain suitable for PyRapide.

    The minimal example is a single bounded session, so the causal edges are
    intentionally direct. A full adapter would use packet_id, decision_id,
    report_id, finding_id, and evidence references to build edges across
    concurrent sessions.
    """

    by_type: dict[str, str] = {}
    by_decision: dict[str, str] = {}
    causal_events: list[CausalEvent] = []

    for row in audit_events:
        name = event_name(row, event_mapping)
        payload = row.get("payload", {})
        causes: list[str] = []

        if name == "hacp.packet.created":
            pass
        elif name == "hacp.decision.approve_next_packet":
            causes.append(require_key(by_type, "packet.created", row["audit_id"]))
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.packet.approved":
            decision_id = payload.get("decision_id")
            require(decision_id is not None, f"{row['audit_id']} missing payload.decision_id")
            causes.append(require_key(by_decision, decision_id, row["audit_id"]))
        elif name == "hacp.decision.start_work":
            causes.append(require_key(by_type, "packet.approved", row["audit_id"]))
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.transport.rendered":
            causes.append(require_key(by_type, "packet.approved", row["audit_id"]))
        elif name == "hacp.report.imported":
            causes.append(require_key(by_type, "transport.rendered", row["audit_id"]))
        elif name == "hacp.finding.created":
            causes.append(require_key(by_type, "report.imported", row["audit_id"]))
        elif name == "hacp.decision.mark_complete":
            # In the minimal fixture, completion is justified by the imported
            # report and review finding rather than by transport alone.
            causes.append(require_key(by_type, "finding.created", row["audit_id"]))
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.session.closed":
            causes.append(require_key(by_type, "decision.recorded:mark_complete", row["audit_id"]))

        causal_event = CausalEvent(
            event_id=row["audit_id"],
            name=name,
            source=row["actor_id"],
            payload=payload,
            audit_record=row,
            caused_by=tuple(causes),
        )
        causal_events.append(causal_event)

        by_type[row["event_type"]] = row["audit_id"]
        if name.startswith("hacp.decision."):
            decision = payload.get("decision", "unknown")
            by_type[f"decision.recorded:{decision}"] = row["audit_id"]

    return causal_events


def ancestors(events_by_id: dict[str, CausalEvent], event_id: str) -> set[str]:
    root = events_by_id.get(event_id)
    require(root is not None, f"unknown event_id {event_id!r}")
    seen: set[str] = set()
    stack = list(root.caused_by)
    while stack:
        current = stack.pop()
        if current in seen:
            continue
        event = events_by_id.get(current)
        require(event is not None, f"{event_id} references missing cause {current!r}")
        seen.add(current)
        stack.extend(event.caused_by)
    return seen


def check_constraints(events: list[CausalEvent]) -> None:
    by_id = {event.event_id: event for event in events}
    by_name: dict[str, list[CausalEvent]] = {}
    for event in events:
        by_name.setdefault(event.name, []).append(event)

    approved = require_event(by_name, "hacp.packet.approved")

    for report in by_name.get("hacp.report.imported", []):
        require(
            approved.event_id in ancestors(by_id, report.event_id),
            "report.imported must trace back to packet.approved",
        )

    for rendered in by_name.get("hacp.transport.rendered", []):
        require(
            approved.event_id in rendered.caused_by,
            "transport.rendered must be directly caused by packet.approved",
        )
        require(
            rendered.payload.get("outboundTransport") == "none",
            "render-only transport must not declare outbound transport",
        )

    for report in by_name.get("hacp.report.imported", []):
        if report.payload.get("boundaries_preserved") is False:
            require(
                report.payload.get("requested_next_step") == "request_human_decision",
                "boundary breach reports must request human decision",
            )

    closeout = require_event(by_name, "hacp.session.closed")
    mark_complete = require_event(by_name, "hacp.decision.mark_complete")
    require(
        mark_complete.event_id in closeout.caused_by,
        "session.closed must be caused by mark_complete",
    )


def main() -> None:
    audit_events = load_audit_events(DEFAULT_AUDIT)
    event_mapping = load_event_mapping(DEFAULT_MAPPING)
    causal_events = build_causal_events(audit_events, event_mapping)
    check_constraints(causal_events)
    print(f"Loaded {len(audit_events)} HACP audit events.")
    print(f"Built {len(causal_events)} causal events.")
    print("All HACP/PyRapide adapter-shape constraints passed.")


if __name__ == "__main__":
    main()
