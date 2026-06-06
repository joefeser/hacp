# CLI Bridge Diagnostics And Stop Reasons v0

Status: public candidate.

Diagnostics and stop reasons explain authority, readback, and proof state. They
do not execute hosted commands, perform external mutations, dispatch runtime
work, or prove work completion.

## CLI Bridge Stop And Diagnostic Codes

The base `hacp.stop_response.stop_reason` enum is defined by
[`schemas/stop-response.schema.json`](../../../schemas/stop-response.schema.json).
This CLI bridge candidate may use profile-local diagnostic codes to explain
packet/profile/proof/runtime mismatches. Codes marked `v0-candidate
diagnostic` are not base schema stop reasons unless a future schema/profile
revision adds them. Map them to a canonical stop reason before validating a
base `hacp.stop_response`.

| Code | Meaning | Status |
| --- | --- | --- |
| `STALE_PACKET` | The task packet, profile, report, or expected digest no longer matches current authority evidence. | canonical stop reason |
| `CONTEXT_MISMATCH` | The packet landed in the wrong repo, branch, tool, mode, or parent context. | canonical stop reason |
| `HUMAN_DECISION_REQUIRED` | The next step changes authority, scope, risk, runtime, persistence, or acceptance and needs a human decision. | canonical stop reason |
| `ENVIRONMENT_BLOCKED` | Required local runtime, token/session, dependency, or toolchain is missing or unusable. | canonical stop reason |
| `RELIABILITY_LIMIT_REACHED` | Final state cannot be proven from available readback and continuing would require guessing. | canonical stop reason |
| `MISSING_AUTHORITY` | The packet, report, or requested next step lacks required human-approved authority evidence. | canonical stop reason |
| `WRONG_TOOL_OR_MODE` | The requested tool, command, mode, or adapter path differs from the approved packet/profile boundary. | canonical stop reason |
| `SCOPE_CONFLICT` | The requested work conflicts with allowed scope, forbidden surfaces, or forbidden effects. | canonical stop reason |
| `UNVERIFIED_ASSUMPTION` | A required claim is not supported by evidence that the human can review. | canonical stop reason |
| `DIGEST_MISMATCH` | A declared digest differs from the deterministic canonical digest. | v0-candidate diagnostic |
| `APPROVED_PROFILE_MISSING` | A requested packet cannot be checked against the required approved profile. | v0-candidate diagnostic |
| `APPROVAL_EVIDENCE_REF_MISSING` | Human or corporate approval evidence required by the profile or risky flag is missing. | v0-candidate diagnostic |
| `RUNTIME_IMAGE_MISMATCH` | Requested or observed runtime image does not match the approved profile. | v0-candidate diagnostic |
| `TOOLCHAIN_VERSION_MISMATCH` | Requested or observed toolchain version does not match the approved profile. | v0-candidate diagnostic |
| `PARAM_MISMATCH` | Requested command parameters differ from the approved profile shape or packet boundary. | v0-candidate diagnostic |
| `RISKY_FLAG_NOT_APPROVED` | Compatibility alias for risky flag approval missing or mismatched. | v0-candidate diagnostic alias |
| `PROFILE_PROOF_MISSING` | Runner report lacks approved profile proof required before evidence trust. | v0-candidate diagnostic |
| `PROFILE_PROOF_MISMATCH` | Runner report approved-profile proof differs from packet/profile evidence. | v0-candidate diagnostic |
| `MISSING_OR_INVALID_REPORT` | Required report evidence is absent, malformed, or cannot be imported for review. | v0-candidate diagnostic |
| `OUTPUT_CAPTURE_OVERFLOW` | Captured output or artifact size exceeded allowed packet/profile limits. | v0-candidate diagnostic |
| `WAIVER_EXPIRED` | A supplied waiver is expired or has malformed expiry evidence. | v0-candidate diagnostic |
| `WAIVER_SCOPE_MISMATCH` | A supplied waiver covers a different artifact, mismatch type, profile, packet, report, or scope. | v0-candidate diagnostic |
| `PUSH_REJECTED_NEEDS_HUMAN_REBASE` | A publishing path was rejected by the remote and needs human-owned rebase or branch repair. | workflow stop, not base schema |

## Diagnostic Mapping

| Diagnostic family | Representative codes | CLI bridge code / canonical fallback |
| --- | --- | --- |
| Packet digest | `PACKET_DIGEST_MISMATCH`, `CORPORATE_PROFILE_DIGEST_MISMATCH`, `REPORT_DIGEST_MISMATCH`, `DOCTOR_DIGEST_MISMATCH` | diagnostic: `DIGEST_MISMATCH`; canonical fallback: `STALE_PACKET` or `HUMAN_DECISION_REQUIRED` |
| Approved profile | `APPROVED_PROFILE_MISSING`, `CORPORATE_PROFILE_PACKET_MALFORMED`, `CORPORATE_PROFILE_EXPIRED`, `CORPORATE_PROFILE_APPROVAL_AUTHORITY_MISSING` | diagnostic: `APPROVED_PROFILE_MISSING` or `APPROVAL_EVIDENCE_REF_MISSING`; canonical fallback: `MISSING_AUTHORITY` or `HUMAN_DECISION_REQUIRED` |
| Runtime/toolchain | `RUNTIME_IMAGE_MISMATCH`, `RUNTIME_TOOLCHAIN_MISMATCH`, `TOOLCHAIN_REQUIREMENT_MISSING` | diagnostic: `RUNTIME_IMAGE_MISMATCH` or `TOOLCHAIN_VERSION_MISMATCH`; canonical fallback: `WRONG_TOOL_OR_MODE` or `ENVIRONMENT_BLOCKED` |
| Risky flag | `RISKY_FLAG_APPROVAL_MISSING`, `RISKY_FLAG_APPROVAL_REF_MISMATCH`, `RISKY_FLAG_FORBIDDEN`, `RISKY_FLAG_NOT_APPROVED` | diagnostic: `RISKY_FLAG_NOT_APPROVED`; canonical fallback: `MISSING_AUTHORITY` or `HUMAN_DECISION_REQUIRED` |
| Profile proof | `APPROVED_PROFILE_PROOF_MISSING`, `APPROVED_PROFILE_PROOF_MISMATCH`, `APPROVED_PROFILE_CHECK_RESULT_DIGEST_MISMATCH`, `PROFILE_PROOF_MISSING`, `PROFILE_PROOF_MISMATCH` | diagnostic: `PROFILE_PROOF_MISSING`, `PROFILE_PROOF_MISMATCH`, or `DIGEST_MISMATCH`; canonical fallback: `HUMAN_DECISION_REQUIRED` or `MISSING_AUTHORITY` |
| Command params | `PARAM_FORBIDDEN`, `PARAM_REQUIRED_MISSING`, `PARAM_VALUE_OUTSIDE_PROFILE`, `WRONG_TOOL_OR_MODE` | diagnostic: `PARAM_MISMATCH`; canonical fallback: `WRONG_TOOL_OR_MODE` or `SCOPE_CONFLICT` |
| Report import | `REPORT_MISSING`, `REPORT_MALFORMED`, `REPORT_IMPORT_VERIFICATION_FAILED` | diagnostic: `MISSING_OR_INVALID_REPORT`; canonical fallback: `HUMAN_DECISION_REQUIRED` |
| Waiver | `PROFILE_MISMATCH_WAIVER_EXPIRED`, `PROFILE_MISMATCH_WAIVER_ALLOWED_SCOPE_MISMATCH`, `PROFILE_MISMATCH_WAIVER_ARTIFACT_SCOPE_MISMATCH` | diagnostic: `WAIVER_EXPIRED` or `WAIVER_SCOPE_MISMATCH`; canonical fallback: `MISSING_AUTHORITY` or `HUMAN_DECISION_REQUIRED` |
| Output bundle | `RUNNER_OUTPUT_OVERFLOW`, `RUNNER_OUTPUT_BUNDLE_DIGEST_MISMATCH`, `RUNNER_OUTPUT_BOUNDARY_INVALID` | diagnostic: `OUTPUT_CAPTURE_OVERFLOW` or `DIGEST_MISMATCH`; canonical fallback: `HUMAN_DECISION_REQUIRED` |
| Environment/context | local dependency, session, tool, or context mismatch findings | `ENVIRONMENT_BLOCKED`, `CONTEXT_MISMATCH`, `STALE_PACKET` |

## Fail-Closed Order

1. Verify packet/profile identity and canonical digest before report trust.
2. Verify approved profile proof before accepting report evidence.
3. Fail closed for runtime/toolchain mismatch unless a matching, unexpired
   waiver covers the exact mismatch and scope.
4. Fail closed for risky flag use unless the exact required approval ref is
   present.
5. Fail closed for output capture overflow unless packet/profile evidence
   explicitly allows it.
6. Return `HUMAN_DECISION_REQUIRED` when the next action changes authority or
   risk acceptance.
