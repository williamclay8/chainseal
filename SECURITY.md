# Security

Chainseal is designed to fail closed.

## Default Boundaries

- No hosted memory backend by default.
- No remote MCP by default.
- No `.env` or `.mcp.json` required.
- No raw transcript storage.
- No secret/env/API-key storage.
- No delete/update/list/batch/extract memory mutation without explicit scoped user intent.
- Memory recall is a lead, not proof.

## Supported Surface

The public package surface is the npm package named `chainseal`. The current supported security boundary is local-only:

- CLI candidate gating.
- Explicit local JSONL receipt ledgers.
- Local recall packets generated from those receipts.
- Local ledger audits.
- Packaged schemas and skill docs.

Hosted memory, remote MCP, vector databases, provider connectors, wallets, OAuth flows, and customer data are out of scope unless a future release explicitly documents the boundary.

## Before Publishing Or Deploying

Run:

```bash
npm test
npm run pack:dry
```

Then inspect the tarball manifest for accidental private files.

## Before Hosted Or Remote Use

Run a separate secret/environment safety review before:

- hosted memory backends;
- remote MCP endpoints;
- vector databases;
- wallets or private keys;
- provider logs;
- OAuth URLs;
- customer data;
- live connector smoke tests.

## Reporting Issues

Report security issues privately to `clay@vantaprivacy.xyz`.

Please include:

- the affected package version;
- the command or workflow involved;
- a minimal reproduction using fake secrets only;
- whether the issue could expose secrets, raw transcripts, customer data, provider logs, OAuth URLs, wallet/private-key material, or untrusted memory as instructions.

Do not include real secrets, `.env` values, private keys, OAuth URLs, customer data, or raw agent transcripts in a report. If a public issue is useful, open it only after the sensitive details have been removed.
