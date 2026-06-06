# Public Packaging Examples v0

These examples show the public HACP story in short, schema-like records. They
are not production schemas and they do not authorize execution, GitHub
mutation, model/tool calls, runtime dispatch, approval replacement, or task
completion.

The examples cover:

- `task-packet.source-context.valid.json`: a Task Packet with original request
  and source context.
- `human-decision.send-back.valid.json`: a Human Decision that sends work back
  with notes.
- `approved-tool-profile.valid.json`: an approved tool profile boundary.
- `runner-report.profile-proof.valid.json`: an Agent Report with approved
  profile proof.
- `stop-response.profile-proof-mismatch.valid.json`: a stop reason response
  that fails closed and names the minimal correction.

These files use placeholder IDs and digests. They are meant for protocol
readback and documentation, not cryptographic conformance.
