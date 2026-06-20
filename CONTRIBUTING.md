# Contributing

Thanks for helping make Chainseal sturdier.

Chainseal is a memory trust boundary for coding agents. Keep contributions focused on source-backed, local-first, backend-neutral memory safety.

## Ground Rules

- Keep the product surface branded as Chainseal.
- Do not add provider-specific product marks to package names, public examples, or scripts.
- Do not add hosted, remote, wallet, OAuth, customer-data, or provider-log workflows without a separate security review.
- Do not store or paste real secrets, `.env` values, private keys, OAuth URLs, customer data, provider logs, or raw transcripts.
- Treat recalled memory as a lead to verify, not proof.
- Keep mutation actions such as delete, update, list, batch, and extract behind explicit scoped user intent.

## Development Checks

Run the local checks before proposing a change:

```bash
npm test
npm run pack:dry
```

For behavior changes, add or update a `node:test` test and a canary case when the behavior is safety-relevant.

## Good First Areas

- Adversarial memory candidate fixtures.
- Source-ref verification.
- Receipt-ledger audit checks.
- Documentation that explains trust boundaries in plain language.
- CI, release, and package-manifest hardening.

## Pull Request Expectations

Include:

- what changed;
- what threat or workflow it improves;
- commands run;
- any skipped checks;
- Lumi status: local, committed, pushed, deployed/live.
