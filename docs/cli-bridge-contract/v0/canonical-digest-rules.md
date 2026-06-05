# CLI Bridge Canonical Digest Rules v0

Status: public candidate.

CLI bridge digest examples use deterministic canonical key sorting before
SHA-256 digest calculation. The digest payload is the JSON object with keys
sorted deterministically, stable primitive representation, and no computed
self-digest field in the payload being hashed.

This candidate intentionally keeps the rule simple. HACP 0.2 core records use
RFC 8785 JSON Canonicalization Scheme; this bridge candidate preserves the same
direction while documenting the proven self-digest exclusions for bridge
objects.

## Self-Digest Exclusions

| Object | Computed field excluded from its own digest |
| --- | --- |
| Corporate Approved Tool Profile Packet | `canonicalDigest` |
| Requested CLI Work Packet | `expectedDigest` |
| Runner Report With Approved Profile Proof | `profileCheckResultDigest` |
| Profile Mismatch Waiver | `canonicalDigest` |
| Runner Output Evidence Bundle | `canonicalDigest` |
| Doctor/Check Output | `doctorDigest` |
| Evidence Import Summary | `summaryDigest` |

## Digest-Bound Authority

The following authority-bearing fields must be included in digest payloads when
present:

- profile identity, profile version, approval authority, approval ref, expiry,
  owner, steward, and approved purpose;
- tool id, executable, version, digest, runtime image, and toolchain versions;
- allowed commands, required params, forbidden params, risky flag rules, and
  exact risky flag approval refs;
- packet profile refs, command, params, approval refs, evidence refs, and packet
  digest;
- waiver authority ref, covered artifacts, allowed scope, reason, status, and
  expiry;
- output capture limits and boundary flags.

## Evidence-Only Digest Inputs

Evidence-only fields still participate in digest readback when they prove
integrity:

- stdout, stderr, artifact refs, and artifact digests;
- observed runtime and toolchain metadata;
- diagnostic code arrays;
- checked artifact refs;
- readback boundary booleans.

## Non-Claims

A valid digest proves byte-for-byte canonical payload integrity. It does not
prove that hosted execution happened, external systems were contacted, network
access was blocked, or work completed.

When no measured network enforcement exists, retain:

```text
network_access_policy=forbidden_by_packet
network_access_observed=unknown
```
