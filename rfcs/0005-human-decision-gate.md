# RFC-0005: Human Decision Gate

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

A Human Decision Gate is the HACP record that changes authority, routing,
status, or closeout. It is the protocol mechanism that prevents agent work,
review agreement, or transport success from becoming implicit approval.

## Required Fields

Every Human Decision Gate record MUST include:

- `hacp_version`;
- `record_kind`;
- `decision_id`;
- `session_id` or `packet_id`;
- `profile_id`;
- `profile_version`;
- `actor_id`;
- `actor_kind`;
- `actor_verification_source`;
- `authentication_context`;
- `decision`;
- `decision_matrix_version`;
- `from_status`;
- `to_status`;
- `reason`;
- `created_at`;
- `evidence`.

Profiles MAY add fields, but they MUST preserve these semantics.

The base Human Decision Gate `record_kind` is `hacp.human_decision_gate`.

## Base Decision Vocabulary

The base decision vocabulary is:

| Decision | Meaning |
| --- | --- |
| `approve_next_packet` | Approve a specific draft packet or next bounded work step without starting execution. |
| `start_work` | Move an approved packet into active work without changing authority. |
| `request_review` | Route approved work to review. |
| `request_human_decision` | Route the session to explicit human judgement when continuation is ambiguous. |
| `mark_blocked` | Record that progress is blocked. |
| `accept_follow_up` | Accept follow-up or resume after a report/review boundary. |
| `cancel_session` | End the coordination session without completion. |
| `mark_complete` | Close the session as completed without implying ship/no-ship. |

These decisions do not include shipping or risk acceptance.

## Base Status Vocabulary

The base status vocabulary is:

- `draft`;
- `approved`;
- `in_progress`;
- `waiting_for_review`;
- `needs_human_decision`;
- `blocked`;
- `completed`;
- `canceled`.

Profiles MAY add status values only when they publish the full decision matrix
and preserve the Human Decision Gate invariants.

## Decision Matrix

An implementation MUST define which decisions are valid from each status. The
matrix MUST be deterministic: a given `(from_status, decision)` pair has at most
one `to_status`.

The decision matrix MUST be published as conformance evidence. User interfaces,
service APIs, CLIs, and automated bridges MUST consume the same matrix or prove
they are generated from the same source.

The base decision matrix is published at
`decision-matrix-base-v0.1.yaml`. Human Decision Gate records MUST
include the matrix version used to validate the transition.

The base matrix keeps approval and execution separate. A follow-up packet
approved from a review boundary returns to `approved`; a later `start_work`
decision moves it to `in_progress`.

The `needs_human_decision` status is reached through `request_human_decision`
when continuation is ambiguous and neither a clean block nor clean follow-up is
honest. Profiles MAY define more specific automatic routes into
`needs_human_decision`, such as loop-ceiling breach handling, but those routes
MUST still be audited.

User interfaces MUST NOT present rejected decisions as available. If a decision
is visible but unavailable, the interface MUST explain why.

Service APIs MUST reject invalid transitions even if a client displays them.
The service decision matrix is authoritative.

## Actor Requirements

The base profile requires a human actor. An `operator` MAY be a role label for a
human acting in the product, but it is not a separate non-human actor kind.
Automated systems, service accounts, CI jobs, and unattended watchers are not
approved actors unless a delegated-approval profile explicitly defines them.

The base `actor_kind` vocabulary contains only `human`.

The actor MUST be recorded server-side or by another profile-defined trusted
mechanism. Clients MUST NOT be able to assert arbitrary approver identity.
Client-supplied actor identity claims MUST be verified against a trusted
identity source, such as a server-side session or credential validation. The
verification mechanism MUST be documented in conformance evidence.

The base `actor_verification_source` vocabulary is:

- `server_session_with_human_interaction`;
- `platform_oauth_with_human_interaction`;
- `signed_human_attestation`.

The `authentication_context` field records the class of authentication used for
the decision, such as `browser_session` or `api_header`. It MUST NOT include the
credential, token, cookie, bearer value, or private key itself.

Each base-profile decision record MUST represent a distinct, non-automated human
act tied to that decision id and packet or session. Automation-triggered
decisions are not base-profile Human Decision Gate decisions.

## Reason Requirement

Every decision MUST include a reason. The reason MUST be durable enough for a
future reviewer to understand why the decision happened.

Empty, placeholder, or auto-generated reasons SHOULD be rejected unless a profile
defines a safe fallback.

## Closeout

`mark_complete` means the coordination session is complete. It MUST NOT imply
that software shipped, risk was accepted, or production release occurred.
The decision MUST cite at least the packet and the most recent Agent Report in
its `evidence` field.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. invalid transitions are rejected by the service;
2. UI-visible decisions match the service decision matrix;
3. every decision records actor, timestamp, reason, and from/to status;
4. client-supplied actor identity is rejected or ignored;
5. `mark_complete` does not create ship/no-ship or risk-acceptance authority;
6. the published UI-visible decision matrix matches the service matrix;
7. base-profile decisions reject non-human `actor_kind` values;
8. decisions record actor verification source and authentication context without
   recording credentials.

## Open Questions

- Should reason strings have minimum structure?
- How should delegated approval appear in the decision record?
