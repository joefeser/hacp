# HACP 0.2 Non-Goals

HACP 0.2 is intentionally narrow.

## HACP Does Not Execute Tools

HACP records may describe work, requested next steps, verification evidence, or
execution-profile permissions. The core protocol does not run commands, invoke
CLIs, call tools, or execute verification commands.

## HACP Does Not Call Models

HACP is not a model API protocol and does not define prompts, context windows,
tool calls, model routing, or agent memory.

## HACP Does Not Define a Universal Agent Runtime

Adapters may be CLIs, humans, local tools, hosted agents, or future services.
HACP defines the custody records around the work, not the runtime that performs
the work.

## HACP Does Not Replace Human Approval

An adapter report can request a next step. A match proof can prove custody. None
of those records approve consequential decisions. Human decisions remain
explicit records.

## HACP Does Not Automatically Merge, Deploy, Ship, or Release

HACP 0.2 has no built-in `ship`, `deploy`, `merge`, `release`, or `accept_risk`
authority. Profiles that need dangerous effects must declare them outside HACP
core and preserve explicit human approval.

## HACP Does Not Require a Specific Stack

No web framework, queue, database, programming language, schema registry, or
message bus is required.

## HACP Does Not Require Automated Transport

Manual copy/paste, browser upload, local file carry, and automated transport can
all be modeled as transport profiles. Automated transport is an extension, not
the default.

## HACP 0.2 Is Not 1.0

HACP 0.2 is experimental. A future 1.0 should require independent
implementations, conformance fixtures, migration rules, and a stable security
model.
