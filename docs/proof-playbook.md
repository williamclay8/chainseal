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
- valid source line range when provided;
- matching source hash when provided;
- verified evidence status;
- non-secret sensitivity.

Blocked candidates:

- secret-like assignment;
- raw transcript shape;
- unsupported/source-free claim;
- instruction-injection-shaped text;
- obfuscated instruction-injection text;
- missing source file;
- invalid source line range;
- source hash mismatch.

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
- possible moved-file matches;
- source hash mismatches;
- invalid source line ranges;
- secret-like receipt content;
- missing Lumi state;
- review-after dates that have passed;
- expired or invalidated receipt validity;
- contradictory receipts sharing a `fact_key`.

## Adapter Contract Proof

Inspect the backend-neutral contract:

```bash
chainseal schema adapter-contract
chainseal adapter-contract
```

The contract is fail-closed: backend adapters should only write when the returned packet has `ok: true` and a non-null `backend_request`.

## Local MCP Proof

Inspect the local facade:

```bash
chainseal mcp-descriptor
chainseal-mcp descriptor
```

The facade is local stdio JSON-RPC. It exposes propose-store, recall-packet, audit, receipt preview, and schema-name tools. It does not expose broad mutation tools.

## Package Proof

Before publishing, inspect:

```bash
npm run pack:dry
```

The tarball should include the CLI, library, schemas, docs, security policy, and skill pack. It should not include `.env`, `.mcp.json`, test temp files, local receipts, private logs, or workspace-only artifacts.
