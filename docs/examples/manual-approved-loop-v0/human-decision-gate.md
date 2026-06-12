# Human Decision Gate

A human decision gate records what is approved, what remains denied, what
evidence supports the decision, and which future work still requires a separate
approval.

Evidence can inform the decision. Evidence does not approve the next step by
itself.

## Decision Record Shape

```yaml
decision_gate:
  decision_id: hdg_manual_loop_v0_example
  selected_decision: accept_follow_up
  approved_next_step:
    description: "Apply the approved documentation-only follow-up."
    scope:
      - "Use the reviewed evidence chain."
      - "Edit only the approved documentation paths."
  denied_authority:
    - runtime execution
    - transport dispatch
    - retry
    - second attempt
    - autonomous continuation
    - production readiness claim
    - compliance claim
    - certification claim
    - formal standardization claim
  evidence_refs:
    - bar_manual_loop_v0_example
    - docs_backed_product_readback_manual_loop_v0
  requires_separate_future_approval:
    - any runtime, transport, or self-running implementation
    - any schema or protocol semantics change
    - any production, compliance, certification, or standardization claim
```

## Boundary

A human decision record approves consequential next steps. A report, proof,
receipt, checksum, or readback does not.

## Related Files

- [Evidence chain](./evidence-chain.md)
- [Bounded action report](./bounded-action-report.md)
- [Docs-backed product readback](./docs-backed-product-readback.md)
- [Proof is evidence, not approval](../../concepts/proof-is-evidence-not-approval.md)
