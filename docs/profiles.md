# HACP 0.2 Profiles

Profiles declare how a HACP implementation uses the core records.

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
