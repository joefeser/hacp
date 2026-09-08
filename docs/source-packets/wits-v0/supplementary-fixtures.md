# WITS candidate supplementary fixtures

These eleven records were emitted by the regenerated WITS implementation at
`48bac116b1077a81dc7adf8e34c78cc3da17c7b2` ([WITS #1369](https://github.com/joefeser/what-is-the-spec/pull/1369)).
They form three branch bundles: successful continuation (6 records), pre-start
stop (4), and stop with a distinct non-authorizing human response (5). The stop
branches share their four antecedents. They were generated through WITS's native
Product Decision and candidate persistence services using synthetic local data,
without importing who-decides runtime code.

The [external manifest](../../../fixtures/supplementary/v0.3-candidate/wits/external-bundle-manifest.json)
pins the exact bytes and HACP package. The [validation receipt](supplementary-validation-receipt.json)
records the HACP-side result, source pin, manifest digest, and limitations.
HACP's validator at `6393cd893296c7566059ca95347d82b9454fc2a7` accepted all three
bundles after comparing the complete 22-case canonical negative corpus exactly.
The WITS repository and PR may require access; the complete public-safe emitted
bytes and their HACP-side validation evidence are retained in this public repo.

From the HACP repository root:

```sh
npm ci
npm run hacp:v03-external -- --root fixtures/supplementary/v0.3-candidate/wits
npm run hacp:v03-candidate
```

The candidate suite includes a check of these committed WITS bundles. The
canonical fixtures, seven record schemas, eight digest domains, and validator
implementation remain the published package.

## Reproduction and evidence limits

The WITS integration suite at the source pin generated these files with
`RUN_HACP_V03_CANDIDATE_INTEGRATION=true`,
`HACP_V03_CANDIDATE_SOURCE_COMMIT=48bac116b1077a81dc7adf8e34c78cc3da17c7b2`, and
`HACP_V03_CANDIDATE_CANARY_OUTPUT` pointing at an empty output directory. Run
`npx vitest run -c vitest.integration.config.ts tests/integration/hacp-v03-candidate-interworking.integration.test.ts`
with `TEST_DATABASE_URL` set to a disposable local test database: the suite resets
its database. This run used PostgreSQL 16 with pgvector, the Prisma schema, and
the candidate SQL guards from migration 0055. All 8 integration tests passed.
Fresh runs use new UUIDs and database timestamps; the manifest pins this run's
bytes, not byte equality between independently seeded databases.

All actor/session references are synthetic test evidence. Fixture validity
references do not prove current expiry or revocation to another consumer, and
persisted start ordering does not prove absence of pre-commit computation.
The proof makes no provider/model calls, HACP dispatch, deployment, or external
effect claims. WITS and HACP share the canonicalize dependency, retaining
common-mode library risk. WITS Task 1.3f remains open: digest-bearing records use
an immediately prior post-lock database time, while the final atomic CTE rechecks
time and expiry; single-read timestamp provenance is unproven.

Joe accepted the pinned who-decides 44-case proof and this regenerated WITS
production/cross-validation evidence for candidate publication under
[HACP #47](https://github.com/joefeser/hacp/issues/47). This is not full-release
qualification. Bidirectional production and consumption remains a separate
future gate, and [HACP #52](https://github.com/joefeser/hacp/issues/52) retains
its existing status.
