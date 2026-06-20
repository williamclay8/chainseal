---
name: chainseal
description: Use when deciding whether agent memory should be stored, recalled, audited, routed, or exposed to tools; when memory candidates need source-truth, secret, transcript, prompt-injection, provenance, or Lumi checks; or when Chainseal workflows should gate backend memory writes.
---

# Chainseal

## Purpose

Use Chainseal as a gated memory trust boundary, not as a replacement for source truth. Prefer local-only workflows until hosted connectors, credentials, and data boundaries are explicitly approved.

Chainseal is a local source-truth, provenance, redaction, and review layer above memory backends. Read `references/control-plane.md` when the user asks how to make coding-agent memory safer or more robust.

## First Move

1. Run `skill-governance-gate` before adding, changing, or promoting MCP, SDK, connector, skill, automation, or global config.
2. Run `secret-env-safety-audit` before hosted memory, remote MCP, vector databases, wallets, API keys, env files, provider logs, or live connector smoke tests.
3. Inspect current backend state only through redacted surfaces. Do not paste raw config with secret values.
4. Keep recalled memory as a lead to verify against repo files, tests, CI, provider state, or live URLs.

## Store Policy

Store only compact, source-backed, non-secret memories:

- `episodic`: session event, task outcome, or incident
- `semantic`: durable fact, decision, or constraint
- `procedural`: repeatable workflow or command pattern
- `self_model`: stable collaboration preference or boundary
- `introspective`: post-run synthesis with caveats

Do not store secrets, env values, OAuth URLs, wallet/private-key material, raw transcripts, private customer data, provider logs, or unsupported claims.

Before storing, updating, deleting, batch-ingesting, extracting, or promoting memories, run the local candidate gate when available:

```bash
chainseal gate candidate.json
```

Allowed stores are still downstream of source truth. If the candidate belongs in repo docs, an active task board, or cross-session memory rather than a local backend, route it there instead of forcing everything into one store.

For local receipt writes, require an explicit ledger path:

```bash
chainseal store candidate.json --ledger ~/.chainseal/receipts.jsonl
```

Recall must return a packet with provenance and verification requirements:

```bash
chainseal recall "query" --ledger ~/.chainseal/receipts.jsonl
```

Audit local receipt ledgers before treating memory as healthy:

```bash
chainseal audit --ledger ~/.chainseal/receipts.jsonl
```

## Tool Boundaries

- Recall and stats tools are allowed for local read-only checks.
- Store tools are allowed only for compact, verified, non-sensitive facts.
- Associative discovery tools are allowed for brainstorming, never for proof.
- Delete, update, list, batch-store, and extraction tools require explicit user intent and a scoped reason.

## Verification

Run the canary after wiring a backend adapter or changing this skill:

```bash
chainseal canary /path/to/repo
```

Report local, committed, pushed, and deployed/live status. Backend data lives outside the repo, so name that boundary when memory was written.

## Lumi

Chainseal changes are local until committed and pushed. MCP config is global local state, not deployed/live. Hosted or remote memory is not enabled unless a separate approved step says so.
