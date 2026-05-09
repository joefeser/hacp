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


@dataclass(frozen=True)
class CausalEvent:
    """Small stand-in for a PyRapide-style immutable event."""

    event_id: str
    name: str
    source: str
    payload: dict[str, Any]
    caused_by: tuple[str, ...] = field(default_factory=tuple)


def load_audit_events(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def event_name(audit_event: dict[str, Any]) -> str:
    event_type = audit_event["event_type"]
    if event_type == "decision.recorded":
        decision = audit_event.get("payload", {}).get("decision", "unknown")
        return f"hacp.decision.{decision}"
    return f"hacp.{event_type}"


def build_causal_events(audit_events: list[dict[str, Any]]) -> list[CausalEvent]:
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
        name = event_name(row)
        payload = row.get("payload", {})
        causes: list[str] = []

        if name == "hacp.packet.created":
            pass
        elif name == "hacp.decision.approve_next_packet":
            causes.append(by_type["packet.created"])
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.packet.approved":
            causes.append(by_decision[payload["decision_id"]])
        elif name == "hacp.decision.start_work":
            causes.append(by_type["packet.approved"])
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.transport.rendered":
            causes.append(by_type["packet.approved"])
        elif name == "hacp.report.imported":
            causes.append(by_type["transport.rendered"])
        elif name == "hacp.finding.created":
            causes.append(by_type["report.imported"])
        elif name == "hacp.decision.mark_complete":
            # In the minimal fixture, completion is justified by the imported
            # report and review finding rather than by transport alone.
            causes.append(by_type["finding.created"])
            by_decision[row["target_id"]] = row["audit_id"]
        elif name == "hacp.session.closed":
            causes.append(by_type["decision.recorded:mark_complete"])

        causal_event = CausalEvent(
            event_id=row["audit_id"],
            name=name,
            source=row["actor_id"],
            payload=row,
            caused_by=tuple(causes),
        )
        causal_events.append(causal_event)

        by_type[row["event_type"]] = row["audit_id"]
        if name.startswith("hacp.decision."):
            decision = payload.get("decision", "unknown")
            by_type[f"decision.recorded:{decision}"] = row["audit_id"]

    return causal_events


def ancestors(events_by_id: dict[str, CausalEvent], event_id: str) -> set[str]:
    seen: set[str] = set()
    stack = list(events_by_id[event_id].caused_by)
    while stack:
        current = stack.pop()
        if current in seen:
            continue
        seen.add(current)
        stack.extend(events_by_id[current].caused_by)
    return seen


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def check_constraints(events: list[CausalEvent]) -> None:
    by_id = {event.event_id: event for event in events}
    by_name: dict[str, list[CausalEvent]] = {}
    for event in events:
        by_name.setdefault(event.name, []).append(event)

    approved = by_name["hacp.packet.approved"][0]

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
            rendered.payload["payload"].get("outboundTransport") == "none",
            "render-only transport must not declare outbound transport",
        )

    for report in by_name.get("hacp.report.imported", []):
        payload = report.payload["payload"]
        if payload.get("boundaries_preserved") is False:
            require(
                payload.get("requested_next_step") == "request_human_decision",
                "boundary breach reports must request human decision",
            )

    closeout = by_name["hacp.session.closed"][0]
    require(
        by_name["hacp.decision.mark_complete"][0].event_id in closeout.caused_by,
        "session.closed must be caused by mark_complete",
    )


def main() -> None:
    audit_events = load_audit_events(DEFAULT_AUDIT)
    causal_events = build_causal_events(audit_events)
    check_constraints(causal_events)
    print(f"Loaded {len(audit_events)} HACP audit events.")
    print(f"Built {len(causal_events)} causal events.")
    print("All HACP/PyRapide adapter-shape constraints passed.")


if __name__ == "__main__":
    main()
