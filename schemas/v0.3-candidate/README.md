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
all seven schemas, verifies the valid cross-record chain and its RFC 8785 JCS
digests, and requires every declared invalid fixture to fail with its expected
diagnostic. To regenerate the committed corpus after an approved contract
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

[`fixtures/manifest.json`](fixtures/manifest.json) pins the source and
who-decides evidence revisions and declares seven expected-valid records plus
fourteen negative cases covering digest mismatch, stripped context,
stale-reference replay, expired and trusted-revoked status, scope expansion,
non-approval consumption, report/reference splicing, loop ceilings, and
start-evidence binding.

The revocation fixture intentionally supplies trusted status as fixture
context. A receipt URI or self-asserted field does not prove revocation.

The historical source-packet examples remain under
[`docs/source-packets/wits-v0/examples/`](../../docs/source-packets/wits-v0/examples/),
but the generated fixtures in this directory supersede those paths as the
conformance corpus.

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

## REVIEW-REQUIRED: second-implementation qualification

The promotion criterion remains unresolved. Joe must choose whether the second
implementation must:

1. independently produce candidate records and cross-validate them with
   who-decides; or
2. both produce and consume records bidirectionally with who-decides.

This package enables either test. Passing it alone is not a second
implementation, does not promote v0.3 beyond candidate status, and does not
prove single-consumer atomicity, provider execution, or exactly-once external
effects.

## Provenance and limits

- HACP source commit: `db47da2118355683f34fd955083c2b3c38769fe4`.
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
