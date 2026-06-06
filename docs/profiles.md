# HACP 0.2 Profiles

Profiles declare how a HACP implementation uses the core records.

The machine-readable draft registry is
[`profiles/hacp-base-draft-v0.2.yaml`](../profiles/hacp-base-draft-v0.2.yaml).
It is the base source for v0.2 profile IDs, digest domains, requested report
shapes, review conditions, and decision values. A base-schema validator may
reject unknown profile IDs. Extension-aware consumers may validate those records
with trusted extension schemas and then reject or route unknown profiles to
human review unless an accepted extension profile declares the ID.

The base JSON Schemas intentionally validate the base registry, not arbitrary
extensions. Profiles that add profile IDs, review conditions, fields, or digest
domains must publish extension schemas or a compatibility validation layer; a
base-only validator may reject those records before protocol routing.

## Base Draft Conformance

An implementation should only claim "HACP 0.2 draft base" support when it can:

- parse and validate the five core v0.2 record kinds;
- recognize the base profile registry values;
- compute SHA-256 digests over RFC 8785 JCS canonical JSON for core records;
- preserve the no-execution boundary unless an execution profile explicitly
  says otherwise;
- keep requested next steps advisory until a human decision record exists.

This is not a stable 1.0 conformance program. It is a draft interoperability
target for review and fixture-building.

## Transport Profiles

A transport profile describes how records move between systems.

Examples:

| Profile | Description | Execution? |
| --- | --- | --- |
| `manual_browser_upload_v0.2` | Human copies or uploads records through a browser session. | No |
| `manual_filesystem_carry_v0.2` | Human carries records through a local file. | No |
| `owner_controlled_cli_v0.2` | Human invokes a local adapter CLI to carry the handoff package; the transport profile itself does not execute task work. | Only if paired with an execution profile |
| `automated_transport_v0.2` | A watcher, queue, webhook, or bus moves already-approved records only; it does not create authority, invoke tools, or approve outcomes. | No by itself |

Transport profiles must not widen authority. A successful transport event only
means a record moved.

## Execution Profiles

An execution profile describes what an adapter may do.

Examples:

| Profile | Description |
| --- | --- |
| `no_execution_passthrough_v0.2` | Validates and reports without performing work. |
| `local_workspace_bounded_v0.2` | May modify allowed local workspace surfaces under a human-approved authority packet. |
| `review_only_v0.2` | Reads allowed surfaces and returns findings only. |
| `verify_only_v0.2` | Runs declared verification checks only when explicitly approved. |

`local_workspace_bounded_v0.2` is not core HACP execution authority. It is an
execution-capable profile that must be explicitly selected inside a
human-approved authority packet. HACP core does not run it.

Execution-capable profiles must declare:

- allowed effects;
- forbidden effects;
- stop conditions;
- credential handling;
- evidence obligations;
- whether verification commands may run;
- how boundary breach is reported.

The base registry includes these declarations for the draft profiles. Richer
execution-capable profiles should define separate profile specs rather than
relying only on the registry summary.

Adapter kind values are intentionally profile-owned. The base schemas require a
non-empty `adapterKind` for evidence, but they do not prescribe a global adapter
registry yet.

Consumers must reject or route to human review when an execution profile exceeds
the authority packet's declared `mode`/`impact` or allowed surfaces. For example,
`local_workspace_bounded_v0.2` is not compatible with an authority packet that
only authorizes `review_only`, unless an accepted extension profile explicitly
defines a narrower safe interpretation.

## Profile Separation Rule

Transport and execution profiles are independent.

For example, `manual_filesystem_carry_v0.2` plus
`no_execution_passthrough_v0.2` means a human carries the package and the adapter
does not execute work. The same transport profile paired with
`local_workspace_bounded_v0.2` has different risk and must be approved
separately.

## Profile Extension Rule

Profiles may extend HACP core vocabulary only when they:

1. declare the extension;
2. version the extension;
3. define rejection behavior for consumers that do not recognize it;
4. preserve the human authority boundary.
