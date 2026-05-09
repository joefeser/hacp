# PyRapide Adapter Shape

This is a non-normative proof-of-concept sketch for mapping HACP audit events
into a PyRapide-style causal event graph.

It is intentionally small and conservative:

- it does not make PyRapide a HACP dependency;
- it does not claim to be an official PyRapide adapter;
- it uses the minimal HACP audit fixture as input;
- it models the adapter shape and HACP constraints that a real integration
  could enforce.

## Why This Might Fit

PyRapide models systems as causal event graphs: events have names, payloads,
sources, and causal predecessors. HACP already defines audit events for packet
creation, Human Decision Gates, transport rendering, report import, findings,
and session closeout.

That makes the possible adapter boundary straightforward:

```text
HACP audit JSONL
  -> HACP-to-PyRapide event adapter
  -> causal graph / poset
  -> HACP invariant checks
```

## Event Mapping

| HACP audit event | PyRapide-style event name | Typical causes |
| --- | --- | --- |
| `packet.created` | `hacp.packet.created` | none |
| `decision.recorded` / `approve_next_packet` | `hacp.decision.approve_next_packet` | `hacp.packet.created` |
| `packet.approved` | `hacp.packet.approved` | approval decision |
| `decision.recorded` / `start_work` | `hacp.decision.start_work` | `hacp.packet.approved` |
| `transport.rendered` | `hacp.transport.rendered` | `hacp.packet.approved` |
| `report.imported` | `hacp.report.imported` | `hacp.transport.rendered` |
| `finding.created` | `hacp.finding.created` | `hacp.report.imported` |
| `decision.recorded` / `mark_complete` | `hacp.decision.mark_complete` | report or finding evidence |
| `session.closed` | `hacp.session.closed` | final Human Decision Gate |

## Constraints Worth Enforcing

A PyRapide integration could enforce HACP invariants such as:

- every imported report traces back to an approved packet;
- render-only manual transport is caused by an approved packet and does not
  create authority;
- boundary-breach reports request `request_human_decision`;
- session closeout traces back to a final Human Decision Gate;
- `real_blocker` findings are paired with a later decision, follow-up packet, or
  terminal state.

## Run The Sketch

The POC uses only the Python standard library so the repository does not take a
runtime dependency on PyRapide.

```bash
python3 examples/integrations/pyrapide/adapter_sketch.py
```

Expected output:

```text
Loaded 9 HACP audit events.
Built 9 causal events.
All HACP/PyRapide adapter-shape constraints passed.
```

## Next Step For A Real Adapter

A real adapter would replace the local `CausalEvent` dataclass with PyRapide's
`Event` and `Computation` primitives, then express the checks as PyRapide
patterns/constraints. The mapping and constraints in this directory are meant to
be a concrete starting point for that discussion.
