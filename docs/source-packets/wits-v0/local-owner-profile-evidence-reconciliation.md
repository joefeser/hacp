# Local Owner Continuation Evidence Reconciliation

Status: candidate implementation evidence complete for the pinned 44-case
inventory. Not owner acceptance, publication approval, a released profile, or
a HACP standard.

The adjacent [machine-readable matrix](local-owner-profile-evidence-matrix.json)
records the complete case disposition. This packet preserves the reviewed
candidate contract as immutable evidence: it does not edit or repin the local
owner profile, fixture inventory, or review synthesis.

## Reviewed Contract

| Artifact | Pin |
| --- | --- |
| HACP candidate source head | `3b61e64d61984f0c5617c4a71266802f31961494` |
| HACP dev merge | `a3383410a46a405725df3cba51a4c81fdb9098ec` |
| Profile SHA-256 | `bc02b5972c2ac1184637062b3dabf7a655ae442cb6fa22940d8d119f678483ec` |
| Fixture inventory SHA-256 | `463f25a09db48863d03344a5225576052d944622d04c997d65057c89c2e77aa0` |
| Review synthesis SHA-256 | `4995b0e2603d695cd005c2bcbfb8e6a6ada1664ff079b148fc20f8b105ba8805` |

The implementation copies of those three documents match these hashes.

## Implementation And CI

The reviewed implementation is who-decides PR
[#10](https://github.com/joefeser/who-decides/pull/10):

- final PR head: `e47515f8b66a318966233fbf416da0b130650ede`;
- merge commit: `c6677da198c166079132ac2a23a39afeade26af3`;
- exact-head CI run:
  [34002175492](https://github.com/joefeser/who-decides/actions/runs/34002175492),
  successful on 2026-09-06;
- CI proof artifact:
  `local-owner-proof-e47515f8b66a318966233fbf416da0b130650ede`;
- durable exact artifact copy:
  [`evidence/who-decides-e47515f8-local-owner-proof.json`](evidence/who-decides-e47515f8-local-owner-proof.json);
- downloaded artifact `result.json` SHA-256:
  `02257303e5880cbc755da1ed310a6c1e6365f4ad5361695d29d67e678062d09d`.

GitHub Actions checked out synthetic merge commit
`22b835d927fe2f7d649b7187911b0cf192506bc5`. Its parents are the PR base
`29389792cc9c149e7c4b3ebf64f9b8bed28c2cb6` and final PR head `e47515f8...`.
Its tree, final PR head, and the eventual merge commit all have tree
`2a5a3d36c29c5e05096cefebdab91d042e72bae3`. The artifact's internal
`gitHead` therefore names the synthetic merge while its source hashes bind the
same exact implementation tree that was merged.

The PR body reported a different proof-file SHA-256,
`47477d9750af9a902e63b40ba8a24d16de26130578bf58d2780f69c101a861b1`.
That value is not the downloaded CI artifact hash and is not used as evidence
here. Whole-result hashes vary because the proof includes observation time,
process IDs, temporary paths, generated IDs, and filesystem identities. The
stable binding is the exact Git tree plus the per-source hashes retained in
the proof receipt.

Key exact-tree source hashes independently matched the CI receipt:

| Source | SHA-256 |
| --- | --- |
| `src/store-admission.ts` | `0b2fe9cb5db791d38c976f55897075ef7e9729a795acc5f78301f84e09fb5905` |
| `src/store-schema.ts` | `47abe3a49c3524e9b4a5c0884a8c945a2d52c60e2dc32875ba4748efa083d109` |
| `src/consumption/store.ts` | `9118bebcf1e2212432c438cbe55bb4f62037551306cadf536a3c686d5f7bd214` |
| `src/local-owner/verifier.ts` | `d7a07274966faadeefa1710d6ea85a562c130433e9c7a8de063a988a8c4fc2ea` |
| `src/local-owner/evidence.ts` | `3d2d601f63f11a8883ef35c6aae19ab6e67393854c158eee8b3033221f941362` |
| `src/local-owner/test.ts` | `2d419c70566a5bbe2019713db225319f28e6526c13c94116e24c5c1eb2a26234` |
| `scripts/local-owner-proof.ts` | `fb236fe2b8d26974d6912c3659a6724c265276b781adc6ae4e67dafe0286cbd6` |
| `scripts/local-owner-legacy-race-child.ts` | `79d35f2e892c4955639ac56f00dea91a115f45c6e43d7ce1c23ec6a6d90d2dd5` |

The CI local-owner test-output SHA-256 is
`daad1a14b3b2864f026a9dfd3b1161545b0e121dcc5340a9be3d6488ad5ec1f5`.
The independent detached-head proof recorded `gitHead` `e47515f8...`, an empty
tracked diff, and result SHA-256
`ca5ded2349b45a06a3f26cc918ff11b2bb38d76d2cf38da4a7b841de6f8e9952`.
Its exact result is retained as
[`evidence/who-decides-e47515f8-local-rerun-proof.json`](evidence/who-decides-e47515f8-local-rerun-proof.json).
That whole-result hash identifies that rerun only; it is not expected to equal
the CI result because run-local observations are intentionally retained.

## Verified Matrix

The exact-head CI proof and independent detached-head proof receipts both
report:

- 44 inventory cases;
- 44 observed and zero uncovered;
- 37 unit receipts and 7 process receipts;
- zero provider calls, zero network callbacks, and no exported secrets.

The linked exact-head CI run also reported successful typecheck, auxiliary test
suites, deterministic scenario, and consumption proof at live review time.
Those auxiliary outputs are not contained in either committed local-owner proof
receipt, so they are contextual CI state rather than part of this durable
44-case evidence reconciliation.

The proof generator derives `observed` only from a passing receipt carrying the
exact fixture ID. Unknown receipt IDs fail. This structurally corrects the
recurring defect species **EVIDENCE_INTEGRITY — proof observed labels outran
test bodies**; inventory labels are no longer an independent source of truth.

Seven cases require process evidence: overlapping claims, overlapping starts,
restart after claim, concurrent revoke/start, revocation before handoff, crash
after intent, and the legacy/candidate admission race. The remaining 37 cases
have exact-ID unit receipts. Every JSON matrix row records a JSON Pointer into
the committed proof artifact and the SHA-256 of that exact receipt object.
Run `node scripts/validate-local-owner-evidence.mjs` to verify the artifact
hash, contract pins, implementation/run-head and checkout-tree consistency,
empty tracked diffs, the complete v3 source-hash inventory, fixture order and
expected text, exact receipt IDs and passing status, receipt digests, and
unit/process classification and aggregate counts in both proofs. Regression
checks run with `node --test scripts/validate-local-owner-evidence.test.mjs`.
This offline check verifies consistency of the retained evidence; it does not
query GitHub to authenticate run metadata or rerun the implementation tests.

## Same-File Admission Evidence

The final legacy/candidate fixture is supported only inside the declared local,
closed-world, same-file boundary. The implementation:

- bootstraps one owner-admitted absolute SQLite main database with both schemas;
- pins canonical path, device/inode, filesystem type, database ID, schema
  digest, configuration generation, WAL/FULL/NORMAL posture, guard directory,
  generation sidecar, hardlink anchor, and writer role/version/insertion paths;
- requires the closed candidate and legacy writer inventory before candidate
  mutation and revalidates admission inside write boundaries;
- rejects relative, symlink, hardlink, distinct, missing, replaced, copied,
  schema-drifted, guard-drifted, stale/unknown writer, incomplete inventory,
  in-memory, unsafe URI/VFS, and unapproved-filesystem cases;
- rejects direct unadmitted access to a candidate store.

The process proof runs separate candidate and legacy processes twice. In the
legacy-first ordering, the legacy receipt commits, candidate admission returns
`MISSING_AUTHORITY`, durable reopen finds one receipt and zero candidate slots,
and `PRAGMA integrity_check` returns `ok`. In the candidate-first ordering, one
candidate slot commits, legacy returns `profile_slot_conflict`, durable reopen
finds zero receipts and one slot, and integrity is `ok`. Barrier events show
the losing process reached `BEGIN IMMEDIATE` while the winner held the write
lock. Each union count is exactly one.

This evidence does not support separate stores, unlisted/direct writers,
unsupported locking filesystems, remote or distributed trust, migration,
recovery or reexecution, provider effects, or exactly-once external effects.

## Readiness Disposition

The pinned who-decides implementation satisfies all 44 observations required
by the candidate inventory. This closes the implementation-evidence gap for a
human decision about candidate publication.

It does not itself provide that human decision. The profile remains
`0.1-candidate`; no schema ID, digest domain, or maturity label changes. After
this reconciliation is merged to HACP `dev`, a separate owner-mediated
`dev`-to-`main` publication PR may present the candidate for human acceptance.
No release, tag, deployment, runtime wiring, or standard promotion follows
automatically.
