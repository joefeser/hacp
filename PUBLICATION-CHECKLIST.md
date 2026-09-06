# Publication Checklist

Use this before making the repository public.

- [ ] Confirm the repository name and description are public-safe.
- [ ] Confirm the license choice in [LICENSE.md](LICENSE.md).
- [ ] Confirm no implementation-specific paths are required for review.
- [ ] Confirm README links resolve from the repository root.
- [ ] Confirm RFC drafts still say HACP is a working draft, not a standard.
- [ ] Confirm schemas and examples validate against the current draft intent.
- [ ] For HACP v0.3 candidate material, confirm owner-accepted external proof
      exists for single-consumer admission, restart readback,
      claim-before-start failure (reject successor start without durable
      readback of its accepted claim), ambiguous execution reporting, and
      expiry/revocation ordering before merging the consumption-contract draft.
- [ ] Before publishing the executable v0.3 candidate conformance package,
      record Joe's approval of every exact digest-domain string and the
      second-implementation qualification rule.
- [ ] Require two independent reviews against the same pinned v0.3 candidate
      package before treating its contracts as publication-ready.
- [ ] Confirm issue templates or discussion settings are ready for public
      review.
- [ ] Decide whether to publish as a personal repo first or move under an
      organisation later.
