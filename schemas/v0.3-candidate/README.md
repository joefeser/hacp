# HACP v0.3 Candidate Conformance Package

Status: executable **candidate** package for early interworking work. It is not
a released standard, an authority grant, or proof of external effects.

This directory supplies closed JSON Schema 2020-12 contracts for seven
candidate record kinds: task packet, human decision, consumption receipt,
continuation context, agent report, review finding, and stop response.

The schemas are informed by the proven who-decides local-owner contracts where
the semantics overlap. The broader candidate shapes retain the historical HACP
source-packet fields so a second implementation can test an actual common
encoding rather than merely similar concepts.

| Candidate record | Proven/source input | Treatment here |
| --- | --- | --- |
| Human decision | who-decides `schemas/local-owner/decision.schema.json` plus the historical HACP example | Preserves immutable human-event, exact-decision, digest, request, action, and evidence binding concepts in the broader HACP shape. |
| Consumption receipt | who-decides `schemas/local-owner/claim.schema.json` plus the historical HACP example | Preserves exact decision digest, claim, attempt, successor, request, scope, expiry, and one-slot admission concepts. |
| Task packet, review finding, continuation context, agent report, stop response | Historical HACP v0.3 source-packet examples and existing v0.1 draft families where applicable | Closed candidate encodings; no claim that who-decides already produces these broader records. |

The who-decides schema files are evidence inputs, not runtime dependencies.
This package does not import who-decides implementation code.

## Validate

From the repository root:

```bash
npm ci
npm run hacp:v03-candidate
```

The command checks that committed vectors are exactly reproducible, compiles
all seven record schemas plus the closed package-manifest schema, verifies three
declared branch-scoped bundles and their RFC 8785 JCS digests, and requires
every declared invalid case to fail with its exact diagnostic set. The flat
fixture inventory is explicitly not a chain and is rejected as a semantic
validation input. Regression tests recompute downstream digests after semantic
mutations so stale references cannot mask an invalid bundle.
To regenerate the committed corpus after an approved contract
change:

```bash
node scripts/compute-vectors.mjs --write --check
```

Generation uses the Apache-2.0 `canonicalize` implementation for RFC 8785 JCS.
For each top-level record, the script removes its own `digest` member and hashes
the UTF-8 serialization of:

```json
{"domain":"<candidate-domain>","record":{}}
```

Embedded reference digests remain present and therefore bind the exact records
they reference. The start-evidence display record uses the same envelope rule
with its separate proposed supporting domain.

## Fixtures

[`fixtures/manifest.json`](fixtures/manifest.json) pins the source-packet,
regeneration-base, and who-decides evidence revisions. Its eleven valid fixture
records form three declared bundles: successful continuation, pre-start stop,
and a later human response to that stop. Their union covers seven protocol
record kinds but is not itself a semantic chain. The manifest also declares
twenty-two negative cases covering digest mismatch, stripped context,
stale-reference replay, expired and trusted-revoked status, scope expansion,
non-approval consumption, report/reference splicing, loop ceilings, and
start-evidence binding, including claim chronology, request-chain continuity,
stop-response packet binding, missing prerequisite records, timestamp edge cases,
and report-return chronology.

The revocation fixture intentionally supplies trusted status as fixture
context. Missing-record cases are omission-only manifest instructions; they do
not retain byte-identical files that would misleadingly appear to be invalid
records. A receipt URI or self-asserted field does not prove revocation.

The v2 manifest is validated before fixture content is trusted. Its
`fixtureInventory` is a non-chain inventory, and `expectedValidBundles` is the
only positive semantic input. Unknown manifest versions, unsafe paths,
undeclared JSON fixtures, ambiguous negative selectors, unexpected roles, and
unknown or duplicate bundle membership fail closed.

Within this candidate package, `stop_response.decisionId` is an identity-only
reference to the real human-decision record presented or evaluated as the
authority basis for the attempted continuation. It is not a decision digest
and does not prove authenticity, currency, sufficiency, admission,
consumption, or revision-exact authority. The required field cannot represent
a pre-decision or no-decision stop; producers must not invent an identifier for
that future contract gap. Likewise, the stopped `successorInvocationId` is the
stop record's bounded assertion, not a positive binding independently
established by an accepted receipt.

The future representation of a stop that has no decision identity is tracked
in [HACP #52](https://github.com/joefeser/hacp/issues/52). That follow-up does
not broaden this candidate package and is not permission to invent a sentinel
identifier.

Timestamp comparisons preserve all supplied fractional-second digits and
normalize time-zone offsets. Instants the harness cannot order, including leap
seconds unsupported by its time parser, fail with `TIMESTAMP_UNCOMPARABLE`;
they cannot silently bypass expiry checks. Report return must follow or equal
work start; return after receipt expiry is still valid historical evidence.

The individual source-packet examples remain under
[`docs/source-packets/wits-v0/examples/`](../../docs/source-packets/wits-v0/examples/),
but they are not one cross-record chain. The branch-scoped generated fixtures
in this directory are the conformance corpus.

## External producer admission

Issue [#54](https://github.com/joefeser/hacp/issues/54) adds a separate,
closed admission boundary for independently produced candidate bundles. It
does not loosen the canonical v2 manifest or allow executable provider code.

An external producer supplies a directory containing exactly:

```text
external-bundle-manifest.json
records/
  ... eleven declared JSON records ...
```

The manifest must validate against
[`package/external-bundle-manifest.schema.json`](package/external-bundle-manifest.schema.json).
It pins the canonical package manifest, all seven record schemas and their
shared definitions, and the semantic validator by SHA-256, plus the exact
schema base URI, ordered digest-domain set, producer identity and source
revision, exactly eleven byte-digested records, and the three ordered bundle kinds. Record paths
are root-relative data paths under `records/`; absolute paths, traversal,
backslashes, symlinks, undeclared JSON files, unknown roles, and additional
fields fail closed.

Validate a producer bundle from the repository root:

```bash
npm run hacp:v03-external -- --root /absolute/path/to/bundle
```

The validator first revalidates the committed canonical package, including
exact diagnostic-set comparison for all twenty-two negative cases. Only then
does it validate the external manifest, byte digests, seven record schemas,
three branch shapes, shared stop antecedents, and all cross-record rules,
including `STOP_AFTER_WORK`. The JSON result preserves the producer's pinned
provenance and candidate-only status.

Passing this entry point is cross-validation evidence. It is not candidate
promotion by itself, authority, approval, proof of independent production,
proof of execution, or proof of exactly-once external effects. Qualification
still requires owner reconciliation under issue #47.

## REVIEW-REQUIRED: candidate digest domains

The following exact strings are proposed and deliberately **not finalized** by
this implementation PR:

- `org.hacp.task-packet.v0.3-candidate`
- `org.hacp.human-decision.v0.3-candidate`
- `org.hacp.consumption-receipt.v0.3-candidate`
- `org.hacp.continuation-context.v0.3-candidate`
- `org.hacp.agent-report.v0.3-candidate`
- `org.hacp.review-finding.v0.3-candidate`
- `org.hacp.stop-response.v0.3-candidate`
- supporting record: `org.hacp.successor-start-evidence.v0.3-candidate`

Joe must approve the exact normative domain set before candidate publication.
Changing a domain changes every affected digest and is a contract change.

## Owner-Ruled Second-Implementation Qualification

Issue [#47](https://github.com/joefeser/hacp/issues/47) records the owner
ruling for candidate promotion: a second implementation must independently
produce candidate records and cross-validate them with who-decides against this
conformance package, including its negative fixtures, without importing
who-decides runtime code.

Bidirectional production and consumption with who-decides is reserved as a
future full-release criterion. Passing this package alone is not a second
implementation, does not promote v0.3 beyond candidate status, and does not
prove single-consumer atomicity, provider execution, or exactly-once external
effects.

The WITS-specific authority disposition in issue
[#48](https://github.com/joefeser/hacp/issues/48) is documented in the
[interworking authority seam](../../docs/source-packets/wits-v0/interworking-authority-seam.md).
A non-authorizing domain decision may remain source evidence, but it cannot be
recast as the separate native human act that approves a bounded successor.

## Provenance and limits

- Historical source-packet commit:
  `db47da2118355683f34fd955083c2b3c38769fe4`.
- Executable regeneration-base commit:
  `73056a53fd87ce20d6a40f8c2188d2fb0a07ce7f`.
- who-decides reviewed proof head:
  `e47515f8b66a318966233fbf416da0b130650ede`.
- who-decides merge commit:
  `c6677da198c166079132ac2a23a39afeade26af3`.
- who-decides `main` inspected while preparing this package:
  `04a89f5509035b3299bb3786da1e9909a4e78dc0`.

The who-decides evidence is local, closed-world, same-file SQLite proof. It does
not establish distributed trust, cross-store atomicity, provider effects, or
exactly-once external effects. These schemas validate record shape; the corpus
also validates a bounded set of cross-record relationships. Neither grants
authority or executes work.
