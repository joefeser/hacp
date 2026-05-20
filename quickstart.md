# HACP Implementer Quickstart

This quickstart is for implementers who already understand the
[adoption primer](adoption-primer.md) and want to run the smallest useful local
HACP validation loop with the draft schema examples.

If you need the plain-language public explanation before running commands,
start with the [public site content spine](site/README.md).

If you need direct answers about fit with PR reviews, CI, agent platforms, and
human approval, read the [FAQ and enterprise objections](site/faq.md).

If you need role-based routing before implementation details, use the
[public navigation pack](site/navigation.md).

For the public-facing protocol overview, start with
[spec/README.md](spec/README.md). It explains the artifact model, authority
boundaries, stop semantics, loop policy, and validation story before the local
commands below.

## Prerequisites

Assume Node.js and npm are available locally.

```bash
npm install
```

## Minimal Local Loop

1. Choose a task packet example, or copy one into your own working location.
   Start from:
   [`schemas/examples/valid/task-packet.valid.json`](schemas/examples/valid/task-packet.valid.json)
2. Validate a known-valid corpus slice:

```bash
npm run hacp:doctor -- schemas/examples/valid
```

3. Review a matching agent report example:
   [`schemas/examples/valid/agent-report.valid.json`](schemas/examples/valid/agent-report.valid.json)
4. Review a matching human decision example:
   [`schemas/examples/valid/human-decision.valid.json`](schemas/examples/valid/human-decision.valid.json)
5. Validate intentional invalid cases and inspect machine-readable diagnostics:

```bash
npm run hacp:doctor -- schemas/examples/invalid --json
```

6. Validate the full examples corpus and manifest expectations:

```bash
npm run hacp:doctor -- schemas/examples --json
```

## Doctor Commands

```bash
npm run hacp:doctor -- schemas/examples/valid
npm run hacp:doctor -- schemas/examples/invalid --json
npm run hacp:doctor -- schemas/examples --json
```

## Expected Exit Codes

- `0`: all checked artifacts match expectations.
- `1`: validation or manifest expectation failure.
- `2`: input, schema, parse, manifest, or environment hard failure.

## What This Quickstart Does Not Do

- no model calls
- no GitHub writes
- no shell execution beyond local validation commands
- no agent dispatch
- no CI/CD/deploy
- no Microsoft integration

## See Also

- [site/README.md](site/README.md)
- [site/faq.md](site/faq.md)
- [adoption-primer.md](adoption-primer.md)
- [spec/README.md](spec/README.md)
- [safe-stop-reliability-boundary.md](safe-stop-reliability-boundary.md)
- [stop-response-decision-guide.md](stop-response-decision-guide.md)
- [schemas/README.md](schemas/README.md)
- [schemas/examples/manifest.json](schemas/examples/manifest.json)
- [schemas/examples/valid/](schemas/examples/valid/)
- [schemas/examples/invalid/](schemas/examples/invalid/)
