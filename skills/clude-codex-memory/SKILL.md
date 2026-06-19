---
name: clude-codex-memory
description: Use when Clay asks to use, install, pilot, audit, configure, or reason about Clude memory for Codex; when Clude MCP/SDK should be adapted from Claude/Cursor to Codex; or when deciding whether to store, recall, export, delete, or promote Clude memories, skills, or workflows.
---

# Clude Codex Memory

## Purpose

Use Clude as a gated Codex memory pilot, not as a replacement for source truth. Prefer local-only MCP experiments until the hosted connector, credentials, and data boundary are explicitly approved.

## First Move

1. Read the local pilot guide when available: `references/adoption-guide.md`.
2. Run `skill-governance-gate` before adding, changing, or promoting Clude MCP, SDK, connector, skill, automation, or global config.
3. Run `secret-env-safety-audit` before hosted Clude, remote MCP, Supabase, wallets, API keys, env files, provider logs, or live connector smoke tests.
4. Inspect current MCP state through redacted surfaces such as `codex mcp list` or the skill-stack harness audit. Do not paste raw config with secret values.
5. Keep Clude recall as a lead to verify against repo files, tests, CI, provider state, or live URLs.

## Default Route

For Codex, prefer the pinned local JSON MCP pilot:

```bash
codex mcp add clude-local -- npx -y @clude/sdk@3.2.0 mcp-serve --local
```

This avoids hosted registration, API keys, Supabase, wallet identity, and first-run embedding model downloads. Treat the more powerful SQLite/vector, hosted, remote HTTP, and self-hosted modes as separate approvals.

## Store Policy

Store only compact, source-backed, non-secret memories:

- `episodic`: session event, task outcome, or incident
- `semantic`: durable fact, decision, or constraint
- `procedural`: repeatable workflow or command pattern
- `self_model`: stable collaboration preference or boundary
- `introspective`: post-run synthesis with caveats

Do not store secrets, env values, OAuth URLs, wallet/private-key material, raw transcripts, private customer data, provider logs, or unsupported claims.

## Tool Boundaries

- `recall_memories` and `get_memory_stats`: allowed for local read-only pilot checks.
- `store_memory`: allowed only for compact, verified, non-sensitive facts.
- `find_clinamen`: allowed for brainstorming, never for proof.
- `delete_memory`, `update_memory`, `list_memories`, `batch_store_memories`, and `extract_skill`: require explicit user intent and a scoped reason.

## Verification

Run the canary after wiring the pilot or changing this skill:

```bash
scripts/clude-codex-canary.sh
```

Report local, committed, pushed, and deployed/live status. Clude data lives outside the repo, so name that boundary when memory was written.

## Lumi

Clude integration changes are local until committed and pushed. MCP config is global local state, not deployed/live. Hosted or remote Clude is not enabled unless a separate approved step says so.
