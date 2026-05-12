# HACP 0.2 Profiles

Profiles declare how a HACP implementation uses the core records.

The machine-readable draft registry is
[`profiles/hacp-base-draft-v0.2.yaml`](../profiles/hacp-base-draft-v0.2.yaml).
It is the base source for v0.2 profile IDs, digest domains, requested report
shapes, review conditions, and decision values. Consumers that receive an
unknown profile ID must reject the record or route it to human review unless a
trusted extension profile declares the ID.

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
| `owner_controlled_cli_v0.2` | Human invokes a local adapter CLI. | Only if paired with an execution profile |
| `automated_transport_v0.2` | A watcher, queue, webhook, or bus moves records. | No by itself |

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

Execution-capable profiles must declare:

- allowed effects;
- forbidden effects;
- stop conditions;
- credential handling;
- evidence obligations;
- whether verification commands may run;
- how boundary breach is reported.

Adapter kind values are intentionally profile-owned. The base schemas require a
non-empty `adapterKind` for evidence, but they do not prescribe a global adapter
registry yet.

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
