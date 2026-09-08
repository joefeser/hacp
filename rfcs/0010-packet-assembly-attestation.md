# RFC-0010: Packet Assembly Attestation

Status: Experimental Draft

Copyright (c) 2026 Joe Feser. Licensed under CC BY 4.0.

This draft uses normative keywords to express design intent. It is a separate,
experimental record family. It does not change, republish, or version-bump the
HACP v0.3-candidate schemas.

## Abstract

A packet digest preserves integrity after construction, but it does not answer
who assembled the packet or how that identity was authenticated. A Packet
Assembly Attestation binds an authenticated builder principal to a specific
construction claim: the exact packet digest, exact source revisions and
digests, construction profile, tool and runtime identities, construction time,
declared transformations, and limitations.

The record is an attestation. It is not proof that the packet was assembled
correctly, that its sources were authentic, that a human approved it, that a
runtime admitted it, or that an executor performed the work.

## Motivation

HACP v0.3-candidate task packets have domain-separated content digests and
source references. Those fields support integrity and interworking checks after
construction. They do not authenticate the builder. This is a real but
non-breaking limitation of the candidate package and does not invalidate its
current integrity, conformance, or WITS interworking evidence.

RFC-0001's base-draft `created_by` field is self-asserted artifact authorship.
It remains useful display metadata, but it is not authenticated construction
provenance. A bare `createdBy` or equivalent string MUST NOT satisfy this RFC.

## Roles

Implementations MUST keep these roles explicit and MUST NOT infer one from
another:

| Role | Responsibility |
| --- | --- |
| Builder or assembler | Constructs the packet from declared inputs. |
| Authorized human approver | Decides whether a bounded continuation may proceed. |
| Runtime issuer or admitter | Admits a continuation under an approved runtime profile. |
| Executor | Performs or attempts the authorized work. |

One principal MAY occupy more than one role, but each role still requires its
own applicable evidence. A builder signature is not human approval. Human
approval is not runtime admission. Runtime admission is not execution proof.

## Record

The experimental record kind is
`hacp.experimental.packet_assembly_attestation`. The draft schema version is
`hacp-packet-assembly-attestation-0.1-draft`.

The record MUST contain:

- a unique attestation identifier;
- an authenticated builder principal claim, authentication method,
  verification-profile reference, and key identifier;
- the exact packet identifier, schema version, and digest;
- one or more exact source references, revisions, representations, and
  digests;
- construction profile identity, version, reference, and digest;
- construction tool identity, version, and artifact digest;
- construction runtime identity, version, and artifact digest;
- construction time;
- declared transformations and their input/output references;
- declared limitations;
- a domain-separated claim digest;
- a cryptographic binding; and
- the required non-authority boundary statement.

The draft machine-readable contract is
[`schemas/experimental/packet-assembly-attestation/v0.1-draft/packet-assembly-attestation.schema.json`](../schemas/experimental/packet-assembly-attestation/v0.1-draft/packet-assembly-attestation.schema.json).

## Canonical Claim and Cryptographic Binding

The claim preimage is the complete top-level attestation record with
`claimDigest` and `cryptographicBinding` omitted. Producers MUST serialize the
following envelope with RFC 8785 JSON Canonicalization Scheme:

```json
{"domain":"io.hacp.packet-assembly-attestation-claim.v0.1-draft","record":{}}
```

`record` is the claim preimage described above. Producers MUST hash the UTF-8
envelope bytes with SHA-256 and place the lowercase hexadecimal result in
`claimDigest.value`. Producers MUST sign the same UTF-8 envelope bytes using
the declared cryptographic scheme. The initial draft fixture profile supports
Ed25519 only.

Digest equality proves integrity after construction. It does not establish
builder identity, source authenticity, correct interpretation, approval, or
execution authority. The signature shows that the holder of the corresponding
private key signed the construction claim. Builder authentication exists only
when an independently selected verification profile binds that key to the
declared principal and authentication method.

## Trust-Anchor Selection

The receiving owner system or an independently authorized verifier MUST select
the accepted verification profile and trust anchors. The attestation MUST NOT
select its own trust merely by naming a profile or key.

A verification profile claiming support for this record MUST define:

- admitted builder principals and authentication methods;
- key or certificate discovery and rotation;
- trust-anchor ownership and current status;
- revocation and expiry processing;
- algorithm policy;
- source revision and digest resolution policy;
- failure and audit behavior; and
- redaction rules for runtime or environment identity.

An unknown, expired, revoked, self-asserted, or otherwise unverifiable builder
MUST fail closed as `UNTRUSTED_BUILDER_PRINCIPAL`. A valid signature from an
untrusted key does not authenticate the builder.

## Verification

A verifier claiming this experimental profile MUST, in order:

1. validate the closed record shape;
2. recompute and compare the domain-separated claim digest;
3. resolve the builder principal, authentication method, and key through the
   independently selected verification profile;
4. verify the cryptographic binding over the canonical claim envelope;
5. compare the exact packet identifier, schema version, and digest with the
   packet under review; and
6. resolve each source revision and digest under the profile's source policy.

The experimental fixture harness uses these stable diagnostics:

| Code | Meaning |
| --- | --- |
| `SCHEMA_VALIDATION_FAILED` | The record is not the closed draft shape. |
| `CLAIM_DIGEST_MISMATCH` | The canonical construction claim changed. |
| `UNTRUSTED_BUILDER_PRINCIPAL` | No accepted profile binds the declared principal, method, and key. |
| `SIGNATURE_INVALID` | The cryptographic binding does not verify. |
| `PACKET_DIGEST_MISMATCH` | The attestation does not bind the exact packet under review. |
| `SOURCE_REVISION_MISMATCH` | A declared source revision differs from trusted resolution context. |
| `SOURCE_DIGEST_MISMATCH` | Resolved source bytes do not match the declared digest. |
| `CONSTRUCTION_ARTIFACT_MISMATCH` | A declared profile, tool, or runtime identity does not match resolved artifact bytes. |

Failure MUST NOT fall back to an unauthenticated `createdBy` value. It MUST NOT
activate approval, admission, execution, retry, or packet-reconstruction
authority.

## Correctness Boundary

Authenticated construction provenance remains an attestation, not proof that
the packet was correctly assembled. A conforming verifier can establish that a
trusted profile associates a principal with the signing key and that the exact
claim has not changed. It cannot establish, from this record alone, that:

- the builder selected every relevant source;
- a source was truthful or authoritative;
- the builder interpreted a source correctly;
- a declared transformation was semantically correct;
- the declared construction time came from a trusted timestamping authority;
- omitted context was irrelevant;
- the packet should be approved;
- a runtime should admit the packet; or
- any execution or external effect occurred.

Those judgments require separate evidence and, where consequential, an
authorized human decision.

## HACP v0.3-candidate Disposition

The absence of this record is a non-breaking HACP v0.3-candidate limitation. It
becomes a correctness defect only when an implementation claims that the
packet builder was authenticated or that correct packet construction was
proven without the required evidence.

This RFC and its experimental schema do not modify the v0.3-candidate task
packet or any of its digest domains, fixtures, manifests, or publication
evidence.

## Conformance Evidence

The experimental package includes a positive signed fixture and negative
fixtures for source-revision substitution, packet-digest mismatch,
self-asserted identity under an untrusted key, signature corruption, and
post-signature claim mutation. The included keys and identities are synthetic,
public test material and MUST NOT be trusted outside the fixture harness.

Run:

```bash
npm run hacp:packet-assembly-attestation
```

Passing the harness proves only that this implementation validates the bounded
fixture contract. It does not authenticate any production builder or promote
the record beyond experimental draft status.

## Open Questions

- Which authentication profiles should be standardized first: workload
  identity, organizational signing keys, or another mechanism?
- How should source resolvers express repository-specific revision semantics?
- Should future profiles support threshold or transparency-log bindings?
- Which construction details require redaction while remaining auditable?
