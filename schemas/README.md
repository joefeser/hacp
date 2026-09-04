# HACP Draft JSON Schemas

## Status

These schemas are **working draft** companion artifacts for HACP v0.1 and HACP
0.2 record shapes. They are public-safe documentation and validation aids, not
a final external standard.

Need a concise enterprise explainer before schema details? See
[../adoption-primer.md](../adoption-primer.md).
Need the smallest runnable local validation loop? See
[../quickstart.md](../quickstart.md).
Need a safe stop shape for unreliable agent state? See
[../safe-stop-reliability-boundary.md](../safe-stop-reliability-boundary.md).
Need to choose a concrete stop reason? See
[../stop-response-decision-guide.md](../stop-response-decision-guide.md).

## Versioning

- Profile/version targets:
  - `hacp-base-draft` / `v0.1-draft` for the original task-packet,
    agent-report, human-decision-gate, review-finding, evidence-set,
    loop-policy, and stop-response shapes.
  - `hacp-base-draft` / `v0.2-draft` for the chain-of-custody authority packet,
    handoff package, adapter report, match proof, and human decision record
    shapes.
- Schema dialect: JSON Schema Draft 2020-12
- `$id` namespaces:
  - `https://hacp.example/schemas/v0.1-draft/`
  - `https://hacp.example/schemas/v0.2-draft/`

Versioning for future phases should preserve backward-readable draft history
rather than rewriting old identifiers.

HACP v0.1 and HACP 0.2 records may coexist as public draft artifacts, but they
are not interchangeable inside one custody chain unless a profile publishes an
explicit translation record. HACP v0.3 source-packet examples are candidate
sketches only until a future schema or profile promotes them.

## Draft Limitations

These schemas validate shape and vocabulary only. They do not execute workflow.

Schema checks are contract-shape checks. They do not grant authority, do not
replace human approval, and do not prove completion.

They do not:

- execute tasks,
- dispatch packets,
- contact agents,
- call models,
- run shell commands,
- write GitHub,
- approve work,
- import reports,
- mutate product records,
- certify external tool compatibility.

## Authority Boundary

- Approval is explicit and human-issued. In v0.1, the
  [Human Decision Gate](human-decision.schema.json) records the approval. In
  v0.2, originating approval is recorded in
  [AuthorityPacket.approval](authority-packet.schema.json); the later
  [HumanDecisionRecord](human-decision-record.schema.json) records the human
  decision after the adapter report and match proof.
- Report verification is custody/integrity evidence, not completion proof.
- File and CLI transport can carry schema-valid artifacts without granting
  approval authority.

## Schema Index

### HACP v0.1 Draft Shapes

- [task-packet.schema.json](task-packet.schema.json)
- [agent-report.schema.json](agent-report.schema.json)
- [human-decision.schema.json](human-decision.schema.json)
- [evidence-set.schema.json](evidence-set.schema.json)
- [stop-response.schema.json](stop-response.schema.json)
- [review-finding.schema.json](review-finding.schema.json)
- [loop-policy.schema.json](loop-policy.schema.json)

### HACP 0.2 Draft Chain-of-Custody Shapes

- [authority-packet.schema.json](authority-packet.schema.json)
- [handoff-package.schema.json](handoff-package.schema.json)
- [adapter-report.schema.json](adapter-report.schema.json)
- [match-proof.schema.json](match-proof.schema.json)
- [human-decision-record.schema.json](human-decision-record.schema.json)

## Evidence Field Compatibility

The base RFCs require simple `evidence` arrays so the minimum contract stays
easy to produce and review. Some draft schemas also allow `evidence_refs` for
more structured references when an implementation has stable evidence IDs,
kinds, or summaries. In this draft, `evidence` remains the required portable
field; `evidence_refs` is optional structured enrichment and must not replace
the required base evidence list.

## Examples

- Canonical valid examples: [`examples/valid/`](examples/valid/)
- Intentional invalid contract tests: [`examples/invalid/`](examples/invalid/)
- Corpus inventory manifest: [`examples/manifest.json`](examples/manifest.json)
- Corpus guidance and claim boundaries: [`examples/README.md`](examples/README.md)
- Reliability boundary stop example:
  [`examples/valid/stop-response.reliability-boundary.valid.json`](examples/valid/stop-response.reliability-boundary.valid.json)
- Stop response fixture pack:
  examples under [`examples/valid/`](examples/valid/) cover every canonical
  `stop_reason`; examples under [`examples/invalid/`](examples/invalid/) cover
  common schema-catchable stop-response mistakes.

These example files are non-executing reference artifacts.

Valid examples show schema-conforming shapes only. They are not endorsements,
approvals, or evidence that any real coordination action occurred.

Invalid examples are intentionally malformed contract tests. They exist to
prove boundary enforcement and must fail validation.

The manifest is a local corpus inventory. It declares which fixtures are
expected valid vs expected invalid, plus record-kind/schema metadata and a
short contract-purpose note per artifact.

Schema-valid examples are not automatically loop-coherent. In this repository
snapshot, manifest checking verifies expected-valid and expected-invalid fixture
outcomes. Cross-artifact reference coherence, loop policy binding, static policy
compatibility checks, and structured repair hints remain draft conformance goals
for later doctor tooling rather than behavior implied by the current local
script.

HACP remains a working draft and vendor-neutral in this phase.

## Doctor CLI (Local Checker)

Use the local doctor to validate a single HACP JSON file or a directory of JSON artifacts:

```bash
npm run hacp:doctor -- <path>
npm run --silent hacp:doctor -- <path> --json
npm run hacp:doctor -- schemas/examples --manifest schemas/examples/manifest.json
```

Exit codes:

- `0`: all scanned artifacts are valid
- `1`: validation/contract diagnostics found
- `2`: usage/environment/input error (for example missing input path, path not found, schema compile problem)

Doctor scope in this phase is intentionally draft, local, read-only, and non-executing.
It validates artifact shape and reports diagnostics only. It does not execute tasks,
dispatch packets, call models, write GitHub, mutate product records, or imply any real
coordination action occurred.

When manifest checking runs, invalid fixtures are expected to fail. The doctor
reports a manifest diagnostic only when actual outcomes differ from manifest
expectations. Doctor diagnostics are intentionally agent-readable, not prose-only:
JSON output preserves stable diagnostic codes, paths, schema names, field paths,
keywords, and validator parameters to support deterministic triage.

## Notes

- `human-decision.schema.json` uses `record_kind: hacp.human_decision_gate`
  for RFC alignment.
- `evidence-set.schema.json` covers a single evidence-set record shape, not the
  JSON Lines audit export format.
- The doctor checks local schema shape and manifest fixture expectations;
  broader semantic conformance across profiles remains draft work.
