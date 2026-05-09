#!/usr/bin/env python3
"""Generate/check the HACP decision-matrix Mermaid diagram."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys

START = "<!-- BEGIN GENERATED DECISION MATRIX -->"
END = "<!-- END GENERATED DECISION MATRIX -->"


def parse_matrix(matrix_path: Path) -> tuple[list[dict[str, str]], list[str]]:
    """Parse the small YAML subset used by decision-matrix-base-v0.1.yaml.

    This avoids adding a dependency just to keep the documentation diagram in
    sync. The parser is intentionally narrow: if the matrix shape changes, this
    script should fail rather than silently misread it.
    """

    transitions: list[dict[str, str]] = []
    terminal_statuses: list[str] = []
    section: str | None = None
    current_transition: dict[str, str] | None = None

    for raw_line in matrix_path.read_text().splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if not raw_line.startswith(" ") and stripped.endswith(":"):
            section = stripped[:-1]
            current_transition = None
            continue

        if section == "terminal_status_values" and stripped.startswith("- "):
            terminal_statuses.append(stripped[2:])
            continue

        if section == "transitions":
            if stripped.startswith("- from_status: "):
                current_transition = {"from_status": stripped.split(": ", 1)[1]}
                transitions.append(current_transition)
                continue
            if current_transition is not None and ": " in stripped:
                key, value = stripped.split(": ", 1)
                current_transition[key] = value
                continue

    required = {"from_status", "decision", "to_status"}
    for transition in transitions:
        missing = required - transition.keys()
        if missing:
            raise SystemExit(f"incomplete transition {transition}: missing {sorted(missing)}")

    if not transitions:
        raise SystemExit(f"no transitions found in {matrix_path}")

    return transitions, terminal_statuses


def render(matrix_path: Path) -> str:
    transitions, terminal_statuses = parse_matrix(matrix_path)

    lines: list[str] = [
        START,
        "```mermaid",
        "stateDiagram-v2",
        "  [*] --> draft",
        "",
    ]

    current_from: str | None = None
    for transition in transitions:
        from_status = transition["from_status"]
        if current_from is not None and from_status != current_from:
            lines.append("")
        lines.append(
            f"  {from_status} --> {transition['to_status']}: {transition['decision']}"
        )
        current_from = from_status

    if terminal_statuses:
        lines.append("")
        for status in terminal_statuses:
            lines.append(f"  {status} --> [*]")

    lines.extend(["```", END])
    return "\n".join(lines)


def replace_block(document: str, generated: str) -> str:
    pattern = re.compile(f"{re.escape(START)}.*?{re.escape(END)}", re.DOTALL)
    if not pattern.search(document):
        raise SystemExit(f"generated block markers not found: {START} / {END}")
    return pattern.sub(generated, document)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--matrix", type=Path, default=Path("decision-matrix-base-v0.1.yaml"))
    parser.add_argument("--diagrams", type=Path, default=Path("diagrams.md"))
    parser.add_argument("--check", action="store_true", help="fail if diagrams.md is not up to date")
    args = parser.parse_args()

    generated = render(args.matrix)
    current = args.diagrams.read_text()
    updated = replace_block(current, generated)

    if args.check:
        if current != updated:
            print(
                "diagrams.md decision matrix is stale; run "
                "python3 scripts/generate_decision_matrix_mermaid.py",
                file=sys.stderr,
            )
            return 1
        print("Decision matrix Mermaid diagram is up to date.")
        return 0

    args.diagrams.write_text(updated)
    print(f"Updated {args.diagrams} from {args.matrix}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
