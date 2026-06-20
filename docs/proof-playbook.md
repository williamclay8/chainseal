# Chainseal Proof Playbook

Use this page to show what Chainseal blocks, allows, and records.

## Local Verification

Run:

```bash
npm test
npm run pack:dry
```

Expected proof:

- syntax checks pass;
- `node:test` behavior tests pass;
- canary blocks unsafe memory candidates;
- package dry-run lists only intended package files.

## Candidate Gate Proof

Allowed candidate:

- compact content;
- verified source ref;
- verified evidence status;
- non-secret sensitivity.

Blocked candidates:

- secret-like assignment;
- raw transcript shape;
- unsupported/source-free claim;
- instruction-injection-shaped text;
- obfuscated instruction-injection text;
- missing source file.

Review-only candidates:

- delete;
- update;
- list;
- batch;
- extract.

## Receipt Ledger Proof

Use an explicit ledger path for any write:

```bash
chainseal store candidate.json --ledger /tmp/chainseal-receipts.jsonl
```

The receipt records:

- candidate content;
- source refs;
- evidence status;
- validity window;
- sensitivity;
- target store;
- gate decision;
- Lumi state.

## Recall Packet Proof

Recall returns a packet, not hidden trusted context:

```bash
chainseal recall "source-backed" --ledger /tmp/chainseal-receipts.jsonl
```

The packet marks memory as a `lead` and requires source verification before action.

## Audit Proof

Audit checks a local ledger:

```bash
chainseal audit --ledger /tmp/chainseal-receipts.jsonl
```

It flags:

- missing source files;
- secret-like receipt content;
- missing Lumi state.

## Package Proof

Before publishing, inspect:

```bash
npm run pack:dry
```

The tarball should include the CLI, library, schemas, docs, security policy, and skill pack. It should not include `.env`, `.mcp.json`, test temp files, local receipts, private logs, or workspace-only artifacts.
