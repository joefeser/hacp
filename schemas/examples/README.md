# HACP Example Corpus Guidance

This folder contains draft HACP fixture artifacts used for local, repeatable
validation checks. These fixtures are protocol documentation assets, not
runtime instructions.

## Purpose

- `valid/` fixtures show schema-conforming artifact shapes.
- `invalid/` fixtures are intentional contract-failure examples.
- `manifest.json` declares expected outcomes and metadata used by local checks.

## What Fixtures Prove

- whether a fixture conforms to the referenced draft schema;
- whether expected-valid and expected-invalid outcomes match manifest
  declarations when manifest-mode checking runs;
- whether artifact vocabulary and basic structure are machine-checkable.
- whether custody artifacts can be validated as records.

## What Fixtures Do Not Prove

- production safety certification;
- autonomous dispatch or execution authority;
- human approval, merge, deploy, or risk acceptance decisions;
- cross-vendor interoperability by themselves.
- task completion proof by report presence or verification.

## Validation Flow

Run the local draft checker against this corpus:

```bash
npm run hacp:doctor -- schemas/examples/valid
npm run hacp:doctor -- schemas/examples/invalid --json
npm run hacp:doctor -- schemas/examples --manifest schemas/examples/manifest.json
```

Expected exit-code behavior:

- `0`: checks passed for the requested target.
- `1`: contract diagnostics found (expected when checking `invalid/` directly).
- `2`: usage, input, schema compile, or environment hard failure.

Validation output is evidence for review. It is not approval and does not grant
execution authority.

File and CLI transport can move these fixtures, but transport success does not
grant authority and does not replace human decision.
