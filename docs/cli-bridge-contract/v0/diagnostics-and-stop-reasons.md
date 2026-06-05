# CLI Bridge Diagnostics And Stop Reasons v0

Status: public candidate.

Diagnostics and stop reasons explain authority, readback, and proof state. They
do not execute hosted commands, perform external mutations, dispatch runtime
work, or prove work completion.

## Public Stop Reasons

| Stop reason | Meaning | Status |
| --- | --- | --- |
| `STALE_PACKET` | The task packet, profile, report, or expected digest no longer matches current authority evidence. | stable |
| `CONTEXT_MISMATCH` | The packet landed in the wrong repo, branch, tool, mode, or parent context. | stable |
| `HUMAN_DECISION_REQUIRED` | The next step changes authority, scope, risk, runtime, persistence, or acceptance and needs a human decision. | stable |
| `ENVIRONMENT_BLOCKED` | Required local runtime, token/session, dependency, or toolchain is missing or unusable. | stable |
| `DIGEST_MISMATCH` | A declared digest differs from the deterministic canonical digest. | stable |
| `APPROVED_PROFILE_MISSING` | A requested packet cannot be checked against the required approved profile. | stable |
| `APPROVAL_EVIDENCE_REF_MISSING` | Human or corporate approval evidence required by the profile or risky flag is missing. | stable |
| `RUNTIME_IMAGE_MISMATCH` | Requested or observed runtime image does not match the approved profile. | stable |
| `TOOLCHAIN_VERSION_MISMATCH` | Requested or observed toolchain version does not match the approved profile. | stable |
| `RISKY_FLAG_NOT_APPROVED` | Compatibility alias for risky flag approval missing or mismatched. | draft alias |
| `PROFILE_PROOF_MISSING` | Runner report lacks approved profile proof required before evidence trust. | stable |
| `OUTPUT_CAPTURE_OVERFLOW` | Captured output or artifact size exceeded allowed packet/profile limits. | stable |
| `WAIVER_EXPIRED` | A supplied waiver is expired or has malformed expiry evidence. | stable |
| `WAIVER_SCOPE_MISMATCH` | A supplied waiver covers a different artifact, mismatch type, profile, packet, report, or scope. | stable |

## Diagnostic Mapping

| Diagnostic family | Representative codes | Stop reason mapping |
| --- | --- | --- |
| Packet digest | `PACKET_DIGEST_MISMATCH`, `CORPORATE_PROFILE_DIGEST_MISMATCH`, `REPORT_DIGEST_MISMATCH`, `DOCTOR_DIGEST_MISMATCH` | `DIGEST_MISMATCH` |
| Approved profile | `APPROVED_PROFILE_MISSING`, `CORPORATE_PROFILE_PACKET_MALFORMED`, `CORPORATE_PROFILE_EXPIRED`, `CORPORATE_PROFILE_APPROVAL_AUTHORITY_MISSING` | `APPROVED_PROFILE_MISSING`, `APPROVAL_EVIDENCE_REF_MISSING`, `HUMAN_DECISION_REQUIRED` |
| Runtime/toolchain | `RUNTIME_IMAGE_MISMATCH`, `RUNTIME_TOOLCHAIN_MISMATCH`, `TOOLCHAIN_REQUIREMENT_MISSING` | `RUNTIME_IMAGE_MISMATCH`, `TOOLCHAIN_VERSION_MISMATCH` |
| Risky flag | `RISKY_FLAG_APPROVAL_MISSING`, `RISKY_FLAG_APPROVAL_REF_MISMATCH`, `RISKY_FLAG_FORBIDDEN`, `RISKY_FLAG_NOT_APPROVED` | `RISKY_FLAG_NOT_APPROVED`, `APPROVAL_EVIDENCE_REF_MISSING` |
| Profile proof | `APPROVED_PROFILE_PROOF_MISSING`, `APPROVED_PROFILE_PROOF_MISMATCH`, `APPROVED_PROFILE_CHECK_RESULT_DIGEST_MISMATCH`, `PROFILE_PROOF_MISSING`, `PROFILE_PROOF_MISMATCH` | `PROFILE_PROOF_MISSING`, `DIGEST_MISMATCH` |
| Waiver | `PROFILE_MISMATCH_WAIVER_EXPIRED`, `PROFILE_MISMATCH_WAIVER_ALLOWED_SCOPE_MISMATCH`, `PROFILE_MISMATCH_WAIVER_ARTIFACT_SCOPE_MISMATCH` | `WAIVER_EXPIRED`, `WAIVER_SCOPE_MISMATCH` |
| Output bundle | `RUNNER_OUTPUT_OVERFLOW`, `RUNNER_OUTPUT_BUNDLE_DIGEST_MISMATCH`, `RUNNER_OUTPUT_BOUNDARY_INVALID` | `OUTPUT_CAPTURE_OVERFLOW`, `DIGEST_MISMATCH`, `HUMAN_DECISION_REQUIRED` |
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
