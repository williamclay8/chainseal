# Chainseal

This repo is the control surface for the Chainseal package: a source-backed memory firewall and trust boundary for coding agents.

## Rules

- Keep the product surface branded as Chainseal.
- Do not add old adapter names, provider-specific product marks, raw install commands, or legacy pilot notes to public docs, examples, package metadata, scripts, or skill files.
- Treat memory recall as a lead to verify, not proof.
- Store only compact, source-backed, non-secret memories.
- Do not pass wallet/private-key material, `.env` values, customer data, provider logs, OAuth URLs, or raw transcripts into memory tooling.
- Do not use delete/update/list/batch/extract memory tools unless the user explicitly asks and the action is scoped.

## Lumi

Track local, committed, pushed, and deployed/live state whenever this package changes. This repo has no deployment surface unless one is added later; npm publish is the release surface when publishing begins.
