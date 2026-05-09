# RFC-0008: Transport Boundary

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

HACP separates coordination authority from execution transport. A human-approved
task packet may be rendered, copied, downloaded, queued, watched, or delivered by
different mechanisms, but those mechanisms do not create, widen, narrow, or
reinterpret authority.

The transport boundary is the rule that prevents a useful bridge from becoming a
hidden approval path.

## Motivation

The originating dogfood trial exposed two practical risks:

- a manual packet export worked through an authenticated API path when the
  browser export context was not available;
- the UI exposed a decision that the service rejected, making it unclear which
  surface a future bridge should trust.

Both issues are transport-boundary problems. A CLI or file-watcher bridge needs
to know exactly which product contract it is consuming. It must not infer
authority from a button label, a URL, an authenticated fetch, or a successful
download.

## Definitions

**Coordination authority** is the authority granted by a human-approved Task
Packet and subsequent Human Decision Gate records.

**Execution transport** is the mechanism that moves packet content to a tool or
returns report content to the product.

**Manual transport** means the human owner performs the content transfer outside
the product runtime, such as copy/paste or download/upload between surfaces.

**Automated transport** means software moves packet or report content without the
human owner physically transferring the content between surfaces. If software
moves the packet after approval without human content transfer, it is automated
transport even when a human clicked the trigger.

## Requirements

### Authority Source

An implementation MUST treat the approved Task Packet and Human Decision Gate
records as the source of authority.

An implementation MUST NOT treat any of the following as authority expansion:

- clipboard copy;
- file download;
- authenticated API response;
- CLI invocation;
- file watcher pickup;
- queue publication;
- webhook delivery;
- model or tool label;
- successful report import.

A transport mechanism MUST verify that a packet is approved before treating it
as authoritative. For manual transport, that verification is the human owner's
responsibility. For automated transport, the verification MUST be programmatic
and auditable. RFC-0001 defines the approval reference that distinguishes an
approved packet from a draft packet.

### Render-Only Export

A render-only export MAY produce Markdown, JSON, or another declared rendering.
The rendering MUST reproduce the approved packet fields without lossy
transformation.

A render-only export MUST declare that it is not automated delivery. It MUST NOT
write packet content to a queue, socket, shell, webhook, model API, or a path the
exporter knows or is configured to treat as a transport pickup location without
a separate automated-transport profile.

The rendering MUST include a transport contract block. A minimal block has:

```yaml
manualTransport:
  transport_profile_id: hacp.manual_transport
  transport_profile_version: v0.1-draft
  productAction: render_only
  deliveryBoundary: human_owner_outside_product_runtime
  outboundTransport: none
  renderAuthenticationContext: browser_session  # one of: browser_session, api_header
```

The `transport_profile_id` and `transport_profile_version` fields follow the
same identifier/version split as HACP profile records. In the base draft,
`hacp.manual_transport` is a built-in render-only transport declaration rather
than an automated bridge profile. Automated transport profiles MUST publish
their own identifiers, versions, discovery locations, and validation rules under
RFC-0009.

The `renderAuthenticationContext` value is required diagnostic metadata in the
base profile. It describes how the product authenticated the export request and
supports audit review of browser-vs-API render paths. It does not grant
authority and MUST NOT include the credential, token, cookie, or bearer value
itself. The base values are `browser_session` and `api_header`; profiles MAY add
values through RFC-0009.

If a render-only export accepts a configurable output path and the
implementation also supports automated pickup locations, the exporter MUST
verify the output path is not registered as a pickup location before writing.
Alternatively, the implementation MUST disable configurable output paths for
render-only export.

### Automated Transport

An automated bridge MAY be added by an implementation-specific HACP profile.
That profile MUST define:

- which packet rendering or API shape the bridge consumes;
- how packet approval is verified against the authoritative decision record;
- which embedded proof, detached proof file, or API contract the bridge uses to
  verify the approval reference;
- how human or profiled delegated approval is verified;
- how packet integrity is verified between render and consumption, such as a
  content hash bound to the approval record, a signature, or an equivalent
  tamper-evidence mechanism;
- how the bridge proves it did not widen authority;
- how the bridge verifies the current decision matrix before attempting a
  decision-gate action;
- which audit rows are emitted;
- how failed delivery is represented;
- how replay or duplicate pickup is prevented;
- which credentials are required and where they are allowed to live.

Automated transport MUST NOT be silently introduced by a render-only export
surface.

An implementation MUST NOT advertise automated-transport HACP conformance unless
it publishes the profile definition it implements.

An automated bridge MUST NOT:

- modify packet fields between render and delivery;
- infer approval from successful delivery;
- retry a rejected Human Decision Gate action;
- consume any file that merely resembles a packet without verifying the approval
  record or a profile-defined proof of approval;
- treat a configured pickup-location transfer as manual transport.

### Automated Transport Audit Contract

An automated transport profile MUST emit audit evidence for:

- packet approval verification, including the `decision_id` checked;
- packet integrity verification, including the hash/signature/check used;
- delivery attempt and delivery result, with timestamp and target;
- explicit no-authority-widening assertion for the delivered content;
- report receipt or import result when the bridge returns agent output;
- rejected decision-gate attempts, including the decision matrix version or
  source used for validation.

This audit contract is the guard against UI/service drift and other bridge
ambiguity. A bridge that cannot produce these records MUST NOT claim automated
transport conformance.

### Common Transport Scenarios

- Human copies approved packet text from the product and pastes it into a CLI
  prompt: manual transport.
- Product renders an approved packet and the human downloads it, then uploads it
  to another tool: manual transport.
- Product writes an approved packet into a directory watched by a CLI agent:
  automated transport.
- A file watcher consumes any file that merely looks like a packet without
  checking approval and integrity: non-conforming.
- A webhook posts a packet to another service after approval: automated
  transport.

### Audit Boundary

Manual transport MAY remain outside the product runtime audit trail if the
product only renders packet content and the human carries it elsewhere.
This optional audit treatment does not make manual transport optional or
authority-bearing; the render-only and non-authorising requirements in this RFC
still apply to manual-only base implementations.

Automated transport MUST emit audit evidence because the product or bridge has
performed work after approval.

An implementation SHOULD distinguish:

- packet approval;
- packet rendering;
- packet delivery;
- report import;
- decision gate action.

Combining these concepts in one audit event weakens reviewability.

## Conformance Checks

A conforming base-profile implementation MUST provide tests or equivalent
evidence that:

1. render-only export code has no outbound HTTP, queue, webhook, shell, model
   API, or configured pickup-location side effect;
2. rendered packet content declares the transport boundary;
3. rendered packet content does not contain credentials;
4. UI-visible decisions match the service decision matrix;
5. automated transport, if present, has an explicit profile, integrity check,
   approval verification, and audit contract;
6. render-only configurable output paths are rejected or checked against the
   implementation's pickup-location registry.

## Non-Conforming Examples

The following are non-conforming:

- a `download` endpoint that also posts the packet to a tool;
- a CLI bridge that treats any readable packet file as approved work without
  checking the approval record;
- a UI that offers a decision the service rejects without explaining why;
- a packet rendering that includes bearer tokens or session cookies;
- a profile that adds `ship`, `accept_risk`, or equivalent autonomous authority.

## Open Questions

- Should HACP require a transport-contract block in Markdown renderings or only
  in machine-readable renderings?
- Should render-only exports be audited, or is stateless rendering acceptable in
  the base profile?
- What replay protections are mandatory for the first automated bridge profile?
