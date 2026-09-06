# WITS Interworking Authority Seam

Status: HACP v0.3 candidate interworking disposition.

Source issue: <https://github.com/joefeser/hacp/issues/48>

This disposition keeps product meaning separate from execution authority. It
does not change the closed HACP v0.3 candidate schemas.

## Decision

WITS must first add a separately governed native continuation-authority action
that already has the semantics and canonical bindings required by the HACP
v0.3 candidate chain. A non-authorizing WITS Product Decision may be retained
as source evidence, but it cannot be recast as, or substituted for, the
`human_decision` whose decision is `approve_bounded_successor`.

The current Product Decision fact `executionAuthorized: false` is therefore a
valid boundary, not a missing approval field. Projecting that record into an
authorizing decision would change its meaning.

## Required Separation

An independent WITS producer may cite a Product Decision through
`evidenceRefs` or its external proof bundle only as non-authorizing evidence.
If cited, that evidence must retain the exact Product Decision request
revision, action revision, action digest, and `executionAuthorized: false`
value. Those facts still do not grant continuation authority.
The producer must separately prove a native human approval act that binds:

1. the exact decision request and proposed action;
2. the exact task packet and its digest;
3. `approve_bounded_successor` and the approved successor scope;
4. the authenticated human actor and decision timestamp;
5. the denied authority.

The downstream admission chain must then bind that exact decision digest, the
applicable expiry and revocation readback, the accepted one-use consumption
receipt, successor start evidence, and the resulting agent report and closing
human-decision request. Later evidence does not become part of the earlier
human act retroactively.

The continuation-authority record must be produced from WITS-owned canonical
source state. An adapter, projection, caller, task packet, transport envelope,
or HACP validator must not invent the join or supply the approver identity.

## Fail-Closed Readback

| Condition | Required treatment |
| --- | --- |
| Product Decision exists, but no native continuation-authority act exists | Stop with `MISSING_AUTHORITY`; no successor work begins. |
| Product Decision records `executionAuthorized: false` | Preserve it as non-authorizing evidence; do not reinterpret it. |
| Caller or adapter supplies an otherwise unproven relationship | Stop with `UNVERIFIED_ASSUMPTION` or `CONTEXT_MISMATCH`; do not manufacture a chain. |
| Product Decision revision, action digest, packet digest, or scope conflicts with the native authority act | Stop with `CONTEXT_MISMATCH` or `SCOPE_CONFLICT`. |
| Authority is expired, revoked, already consumed, or not tied to the intended successor | Use the applicable existing candidate stop and preserve `successorWorkBegan: false`. |

A reference string alone proves neither the referenced record's contents nor
the authority relationship. Qualification evidence must retain the immutable
source records and their canonical bindings so a reviewer can reproduce the
projection.

## Qualification Effect

The owner ruling in issue #47 remains the candidate-promotion criterion:
independent production plus cross-validation with who-decides. For WITS, that
means producing the HACP candidate chain from WITS-owned records and validating
it against the candidate conformance package without importing who-decides
runtime code.

Passing the HACP fixtures alone, projecting a Product Decision, or reusing a
domain-specific consultation or ACK ledger does not satisfy independent
production. Those mechanisms may be implementation precedent, but their
authority cannot be repurposed for a general Product Decision successor.

Bidirectional production and consumption with who-decides remains deferred as
a full-release criterion. It is not required for candidate qualification.

## Deferred Protocol Work

If independent implementations later demonstrate a general need to bind a
non-authorizing domain decision to a separate continuation-authority decision,
that relationship should be proposed as a new candidate contract or named
profile. It must define a closed record shape, digest domain, canonical source
and relationship semantics, actor provenance, mismatch diagnostics, and
negative fixtures. It must not be introduced as an optional field that current
v0.3 candidate consumers silently ignore.

## Non-Claims

This disposition does not:

- authorize WITS execution;
- add or approve a WITS implementation;
- change a Product Decision's meaning;
- add HACP dispatch, model/tool invocation, provider spend, or private data;
- claim WITS has met second-implementation qualification;
- promote HACP v0.3 beyond candidate status; or
- prove provider effects or exactly-once external effects.
