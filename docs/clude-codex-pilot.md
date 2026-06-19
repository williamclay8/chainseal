# Clude Codex Pilot

## Decision

Adopt a gated local Clude MCP pilot for Codex. Do not use Clude's Claude-first installer or hosted connector as the default path.

## Evidence

- Official site: `https://clude.io`
- Docs: `https://clude.io/docs`
- Install page: `https://clude.io/install`
- Repo: `https://github.com/sebbsssss/clude`
- Package: `@clude/sdk`, observed latest `3.2.0`
- MCP name: `io.github.sebbsssss/clude`
- Remote MCP endpoint: `https://clude.io/api/mcp`

## Scope

Pilot mode:

```bash
codex mcp add clude-local -- npx -y @clude/sdk@3.2.0 mcp-serve --local
```

This uses local JSON storage at `~/.clude/memories.json` and avoids hosted registration, API keys, Supabase, wallet identity, and first-run embedding model downloads. It is intentionally less powerful than SQLite/vector mode, but safer for the first Codex integration.

Deferred modes:

- Hosted Clude via `CORTEX_API_KEY`
- Remote HTTP MCP at `https://clude.io/api/mcp`
- Self-hosted Supabase/pgvector
- Default SQLite/vector mode that may download local embedding models under `~/.clude/models`
- Clude's installer commands that mutate Claude/Cursor configs or inject instructions

## Memory Taxonomy

Use Clude's taxonomy only for compact memories:

- `episodic`: task/session events and outcomes
- `semantic`: durable facts, decisions, constraints
- `procedural`: workflows, commands, patterns that worked
- `self_model`: stable agent/user collaboration preferences
- `introspective`: post-run synthesis and caveats

Never store secrets, env values, OAuth URLs, wallet/private-key material, raw transcripts, private customer data, provider logs, or unsupported claims.

## Codex Workflow

1. Start with existing stack memory:
   - Supermemory recall when available and safe
   - GoalBuddy board state for active goals
   - Full Blast lane receipts for broad work
   - Repo files, git, tests, CI, provider state, and live URLs for truth
2. Query Clude only when persistent local recall might help.
3. Verify Clude recall against source truth before acting.
4. Store compact memories only after a durable decision, verified outcome, repeated workflow, or user request to remember.
5. End with Lumi state: local, committed, pushed, deployed/live.

## Guardrails

- Clude MCP is optional and experimental.
- Clude recall is not proof.
- Clude should not replace Supermemory handoffs or GoalBuddy task truth.
- Clude delete/update tools require explicit user approval.
- Clude batch-store and extract-skill tools require a separate governance pass before use.
- Hosted/remote Clude requires `secret-env-safety-audit` and owner approval.

## Canary Checks

Run:

```bash
skills/clude-codex-memory/scripts/clude-codex-canary.sh
```

Pass criteria:

- `codex mcp list` includes `clude-local`
- command is pinned to `@clude/sdk@3.2.0`
- command includes `mcp-serve --local`
- no hosted `CORTEX_API_KEY` is configured for the Clude entry
- no repo `.env` or `.mcp.json` was created by the pilot

## Rollback

Remove the pilot MCP entry:

```bash
codex mcp remove clude-local
```

Then optionally archive or delete local Clude data only with explicit owner approval:

- `~/.clude/memories.json`
- `~/.clude/brain.db`
- `~/.clude/models`

## Lumi

- Local repo: pilot docs and source skill files live here.
- Global skill: copied to `/Users/clay/.agents/skills/clude-codex-memory` when promoted.
- Committed: check `git status --short --branch`.
- Pushed: check the current branch and remote state before claiming.
- Deployed/live: not applicable unless a deployment surface is added later.
