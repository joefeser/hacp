# HACP Draft JSON Schemas

## Status

These schemas are a **working draft** for HACP v0.1-style artifact shapes.
They are public-safe companion artifacts for documentation and validation. They
are not a final external standard.

Need a concise enterprise explainer before schema details? See
[../adoption-primer.md](../adoption-primer.md).
Need the smallest runnable local validation loop? See
[../quickstart.md](../quickstart.md).
Need a safe stop shape for unreliable agent state? See
[../safe-stop-reliability-boundary.md](../safe-stop-reliability-boundary.md).
Need to choose a concrete stop reason? See
[../stop-response-decision-guide.md](../stop-response-decision-guide.md).

## Versioning

- Profile/version target: `hacp-base-draft` / `v0.1-draft`
- Schema dialect: JSON Schema Draft 2020-12
- `$id` namespace: `https://hacp.example/schemas/v0.1-draft/`

Versioning for future phases should preserve backward-readable draft history
rather than rewriting old identifiers.

## Draft Limitations

These schemas validate shape and vocabulary only. They do not execute workflow.

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

## Schema Index

- [task-packet.schema.json](task-packet.schema.json)
- [agent-report.schema.json](agent-report.schema.json)
- [human-decision.schema.json](human-decision.schema.json)
- [evidence-set.schema.json](evidence-set.schema.json)
- [stop-response.schema.json](stop-response.schema.json)
- [review-finding.schema.json](review-finding.schema.json)
- [loop-policy.schema.json](loop-policy.schema.json)

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
