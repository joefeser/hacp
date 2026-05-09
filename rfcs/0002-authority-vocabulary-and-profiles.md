# RFC-0002: Authority Vocabulary and Profiles

Status: Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. These requirements
are not yet validated by independent implementations and may change before a
v1.0 protocol release.

## Abstract

HACP authority values define what a packet recipient may do. They are not status
labels, tool labels, or workflow suggestions. Authority is the protocol boundary
between delegated work and human-only judgement.

## Base Authority Vocabulary

The base profile defines these authority values:

| Value | Required `authority_impact` | Meaning |
| --- | --- | --- |
| `propose_only` | `produces_proposal` | Recipient may propose changes, plans, findings, or next steps, but MUST NOT modify target surfaces. |
| `implement_bounded` | `modifies_allowed_surfaces` | Recipient may modify only the packet's allowed surfaces within the stated scope. |
| `review_only` | `returns_findings_only` | Recipient may inspect inputs and return findings, but MUST NOT apply fixes. |
| `verify_only` | `returns_verification_only` | Recipient may verify stated outcomes and return evidence, but MUST NOT apply fixes. |
| `observe_only` | `observes_state_only` | Recipient may inspect and summarise state, but MUST NOT alter state or request authority changes. |
| `audit_only` | `audits_evidence_only` | Recipient may inspect audit/evidence records and return integrity findings, but MUST NOT alter the underlying work. |

An implementation MAY support a subset of the base vocabulary only if it rejects
unsupported values explicitly.

## Base Profile Identity

Base HACP records MUST carry:

```yaml
profile_id: hacp-base-draft
profile_version: v0.1-draft
```

The profile fields are not conditional extension markers. They are always
present so consumers can determine whether they understand the contract version
before processing a packet, report, finding, decision, audit record, or
transport record.

## Authority Impact Classes

Every authority value MUST map to exactly one base `authority_impact` value. The
base impact vocabulary is:

| Impact | Meaning |
| --- | --- |
| `produces_proposal` | Produces recommendations or draft text without modifying target surfaces. |
| `modifies_allowed_surfaces` | Modifies only surfaces explicitly allowed by the packet. |
| `returns_findings_only` | Produces review findings without applying changes. |
| `returns_verification_only` | Produces verification evidence without applying changes. |
| `observes_state_only` | Reads or summarises state without altering it. |
| `audits_evidence_only` | Reviews audit/evidence integrity without altering the underlying work. |

Profiles MAY add authority values, but they MUST map each added value to one of
these impact classes unless a future HACP version extends the impact vocabulary.
An authority value that cannot fit one base impact class is non-conforming in
v0.1.

## Forbidden Authority Effects

A conforming authority vocabulary MUST NOT include any value whose effect is to:

- release software or content to users;
- merge, deploy, publish, or ship without a Human Decision Gate;
- accept known risk on behalf of users;
- bypass a ship/no-ship decision;
- widen scope silently;
- convert a review or verification result into approval.

The test is effect-based. A profile cannot make `deploy_to_production` conforming
by avoiding the word `ship`.

Profile declarations for authority values MUST include a forbidden-effect
declaration:

```yaml
forbidden_effects:
  releases_to_users: false
  accepts_risk: false
  bypasses_ship_decision: false
  widens_scope_silently: false
  converts_review_to_approval: false
```

Consumers MUST reject a profiled authority value if the declaration is missing
or if any forbidden-effect field is missing or true. Missing forbidden-effect
fields MUST be treated as forbidden, not as false.

## Modes Are Not Authority

A packet mode describes the kind of work, such as implementation, review,
verification, audit, or observation. A mode MUST NOT grant authority by itself.

For example, a packet with `mode: implement` and `authority: propose_only` allows
implementation proposals but not file edits.

## Profiles

A profile is an explicit extension set layered on top of the HACP base profile.
Profiles MAY add:

- authority values;
- packet fields;
- report fields;
- transport mechanisms;
- evidence requirements;
- status values;
- conformance checks.

Profiles MUST preserve all RFC-0000 invariants. Profiles MUST NOT add forbidden
authority effects.

All HACP records MUST include `profile_id` and `profile_version`. Consumers MUST
reject extended vocabulary values when the applicable profile id or version is
unknown or unsupported.

## Profile Declaration

A profile declaration MUST include:

- `profile_id`;
- `profile_version`;
- base HACP draft or version;
- added vocabulary values;
- authority impact mappings;
- forbidden-effect declarations;
- added required fields;
- conformance checks;
- compatibility notes;
- owner or publisher.

## Delegated Approval

The HACP base profile does not define delegated approval. A future profile MAY
define delegated approval only if it includes:

- who may delegate;
- who may act as operator;
- what surfaces or packet classes are covered;
- time bounds;
- revocation;
- audit records;
- how delegation is shown to a human reviewer.

Until such a profile exists, service accounts, CI jobs, unattended watchers, and
pre-approved templates are not approved delegated actors.

A delegated-approval, standing-approval, or template-preapproval profile MUST
NOT claim `base_profile_draft` conformance. It MUST use a distinct profile and
conformance label so base-profile consumers can reject it.

## Conformance Checks

A base-profile implementation MUST provide tests or equivalent evidence that:

1. base authority values are accepted or explicitly rejected as unsupported;
2. forbidden authority effects are rejected;
3. mode values do not imply authority;
4. unknown profile authority values are rejected;
5. every HACP record carries `profile_id` and `profile_version`;
6. profiled authority values declare exactly one base impact class and no
   forbidden effects.

## Open Questions

- What profile identifier syntax should HACP recommend?
- Should delegated approval be a separate RFC or part of RFC-0009?
