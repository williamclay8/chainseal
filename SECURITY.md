# Security

Codex Memory Control Plane is designed to fail closed.

## Default Boundaries

- No hosted Clude by default.
- No remote MCP by default.
- No `.env` or `.mcp.json` required.
- No raw transcript storage.
- No secret/env/API-key storage.
- No delete/update/list/batch/extract memory mutation without explicit scoped user intent.
- Memory recall is a lead, not proof.

## Before Publishing Or Deploying

Run:

```bash
npm test
npm run pack:dry
```

Then inspect the tarball manifest for accidental private files.

## Before Hosted Or Remote Use

Run a separate secret/environment safety review before:

- hosted Clude;
- remote MCP endpoints;
- Supabase or pgvector;
- wallets or private keys;
- provider logs;
- OAuth URLs;
- customer data;
- live connector smoke tests.

## Reporting Issues

This project is local/private until published. If it becomes public, add a public security contact and vulnerability disclosure policy before accepting external reports.
