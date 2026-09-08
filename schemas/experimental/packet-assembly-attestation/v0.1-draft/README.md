# Packet Assembly Attestation v0.1 Draft

Status: experimental draft record family. This directory is not part of the
HACP v0.3-candidate package and does not change that package's schemas, digest
domains, fixtures, or publication status.

The record authenticates a bounded construction claim when an independently
selected verification profile binds the declared builder principal and key. It
keeps the builder or assembler, authorized human approver, runtime issuer or
admitter, and executor as distinct roles.

It does not prove correct construction. It does not establish source
authenticity, approval, runtime admission, execution, completion, or external
effects. A bare `createdBy` string is insufficient.

## Validate

From the repository root:

```bash
npm ci
npm run hacp:packet-assembly-attestation
```

The validator checks the closed schema, RFC 8785 claim digest, Ed25519 fixture
signature, independently supplied synthetic trust binding, exact packet
binding, and source revision/digest resolution. All fixture identities and keys
are public test material with no production authority.

## Files

- `packet-assembly-attestation.schema.json`: closed experimental record shape.
- `fixtures/manifest.json`: exact expected valid and invalid outcomes.
- `fixtures/verification-context.json`: synthetic, independently supplied
  builder trust and source-resolution context for the harness.
- `fixtures/construction/`: exact synthetic profile, tool, and runtime identity
  descriptors bound by the valid attestation.
- `fixtures/valid/`: one authenticated construction claim.
- `fixtures/invalid/`: source substitution, packet mismatch, self-asserted
  identity, signature corruption, changed-claim, and construction-artifact
  mismatch cases.

See [RFC-0010](../../../../rfcs/0010-packet-assembly-attestation.md) for trust,
verification, role-separation, and non-claim semantics.
