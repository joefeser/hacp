# HACP CLI Bridge Contract v0

Status: public candidate.

The HACP CLI bridge contract describes how an owner-controlled CLI or adapter
can carry HACP authority records, return evidence, and fail closed when packet,
profile, runtime, risky flag, waiver, or digest evidence does not match.

This package is vendor-neutral. It does not define a hosted shell, queue,
RabbitMQ runtime, model/tool call layer, GitHub mutation path, or autonomous
dispatcher. HACP records coordinate authority, evidence, review, and approval;
they do not execute work by themselves.

## Contract Shape

An owner-controlled CLI bridge has three separable responsibilities:

1. read an approved profile and requested work packet;
2. produce preflight/readback evidence before a local runner or adapter is
   trusted;
3. return reports, output evidence, diagnostics, waivers, and import summaries
   that a human or owner system can review.

Transport and execution are intentionally separate. A CLI transport can carry
records with no execution profile. An execution-capable adapter must be
explicitly approved by profile and packet evidence before its report is treated
as trusted evidence.

## Public Objects

| Object | Purpose | Public status |
| --- | --- | --- |
| Corporate Approved Tool Profile Packet | Declares the approved tool, runtime, commands, risky flags, evidence refs, expiry, and boundary for a tool profile. | candidate |
| Requested CLI Work Packet | Carries bounded requested work plus the approved profile reference and expected digest. | candidate |
| Packet/Profile Preflight Result | Records whether the packet and profile matched before evidence trust. | candidate |
| Runner Report With Approved Profile Proof | Returns runner evidence plus proof that the approved profile check passed. | candidate |
| Evidence Import Verification Result | Neutral public name for the app-proven product import verification result. It records whether imported report evidence passed custody checks. | candidate |
| Runtime/Toolchain Mismatch Diagnostic | Explains fail-closed runtime or toolchain mismatch evidence. | candidate |
| Risky Flag Approval Proof | Proves that an exact risky flag request had the required approval ref. | candidate |
| Profile Mismatch Waiver | Human-issued scoped exception for a specific mismatch, artifact set, and expiry. | candidate |
| Runner Output Evidence Bundle | Captures stdout, stderr, artifacts, redaction, capture limits, and boundary statements. | candidate |
| Doctor/Check Output | Local diagnostic output for packet/profile/report readiness. | candidate |
| Evidence Import Summary | Neutral public name for the app-proven product import summary. It gives human-readable import status without claiming action execution. | candidate |

See [objects.md](objects.md) for required fields and field stability notes.

## Boundary

HACP CLI bridge evidence is authority/readback/proof evidence. It is not proof
that work completed. It is not hosted execution, external mutation, runner
dispatch, model/tool calling, queue publishing, network enforcement proof, or
approval to merge, deploy, ship, cancel, or accept risk.

The bridge must preserve these short-form claims:

- profile approval alone does not execute work;
- packet/profile preflight is readiness evidence, not completion evidence;
- reports and output bundles are evidence until matched and reviewed;
- import verification checks custody and integrity, not product acceptance;
- waivers cover only exact mismatch, artifact, scope, status, and expiry;
- risky authority transitions require a human decision record.

Network readback should avoid overclaiming. When no measured enforcement exists,
use:

```text
network_access_policy=forbidden_by_packet
network_access_observed=unknown
```

## Example Set

The companion examples are in
[`examples/cli-bridge-contract/v0/`](../../../examples/cli-bridge-contract/v0/).

- `corporate-approved-tool-profile.valid.json`
- `requested-cli-work-packet.valid.json`
- `runner-report.accepted-profile-proof.valid.json`
- `runtime-toolchain-mismatch.rejected.json`
- `risky-flag-approval-missing.rejected.json`
- `waiver-covered-mismatch.accepted.json`
- `doctor-ready.valid.json`
- `doctor-blocked.valid.json`

These examples use placeholder digest values to show field placement and digest
domains. They are not cryptographic conformance vectors.

## Digest And Stop Rules

- [canonical-digest-rules.md](canonical-digest-rules.md)
- [diagnostics-and-stop-reasons.md](diagnostics-and-stop-reasons.md)

## Provenance

This candidate translates implementation-proven CLI bridge objects into public
HACP terminology. Product-specific labels are kept only as compatibility notes;
the public contract uses owner system, verifier, importer, adapter, runner,
profile, packet, evidence, waiver, and human decision language.
