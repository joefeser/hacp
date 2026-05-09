# Security Policy

HACP is currently a working draft for public review. It is not a production
security standard and should not be used as the sole control for deployment,
risk acceptance, identity, or access management decisions.

## Reporting Issues

For now, report security-sensitive concerns privately to the repository owner.
If this repository moves under an organisation, this file should be updated
with the organisation's preferred disclosure address and response expectations.

## In Scope

- Authority-widening loopholes.
- Ways to bypass Human Decision Gate requirements.
- Transport mechanisms that can silently convert manual approval into automated
  execution.
- Audit or evidence gaps that prevent independent review.
- Profile-extension behaviour that permits forbidden authority effects.

## Out Of Scope

- Vulnerabilities in a specific implementation that are not caused by the HACP
  draft contracts.
- Requests to add autonomous `ship`, `accept_risk`, production deployment, or
  risk-acceptance authority to the base vocabulary.
