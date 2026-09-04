# HACP Source Packets

Source packets translate implementation-proven or dogfood-proven work into
public HACP protocol language.

They are explanatory source material, not runtime code, conformance claims, or
product commitments. A source packet may identify candidate schemas, examples,
or conformance fixtures, but those candidates are not stable until promoted by
the normal RFC, schema, profile, and fixture process.

## Packets

- [WITS v0 HACP source packet](wits-v0-hacp-source-packet.md)
- [WITS v0 accountable continuation source packet](wits-v0/accountable-continuation-v0.3-draft.md)
  for HACP v0.3 candidate consumption receipts, successor invocation evidence,
  and fail-closed continuation boundaries.
- [Local owner continuation profile candidate](wits-v0/local-owner-profile.md)
  narrows the approved local verifier/issuer/start policy; implementation proof
  and explicit acceptance remain separate gates.

## Boundaries

Source packets must not add hosted execution, orchestration, model/tool
dispatch, GitHub mutation, billing, worker launch authority, or HACP.io product
claims. Those topics belong to separate products or profiles with explicit
authority and evidence.
