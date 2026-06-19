# Clude Codex Memory Pilot

This repo is the control surface for Clay's Codex-oriented Clude memory pilot.

## Rules

- Use Clude as an optional local MCP experiment, not as the source of truth.
- Keep Supermemory, GoalBuddy, Full Blast receipts, repo files, git, CI, and live deploy evidence authoritative.
- Do not run `npx @clude/sdk setup`, `connect`, `register`, `init`, or hosted/remote Clude commands without explicit approval.
- Prefer the pinned local JSON pilot command:

```bash
codex mcp add clude-local -- npx -y @clude/sdk@3.2.0 mcp-serve --local
```

- Do not pass `CORTEX_API_KEY`, `SUPABASE_SERVICE_KEY`, wallet/private-key material, `.env` values, customer data, or raw transcripts into Clude.
- Store only compact, source-backed, non-secret memories.
- Treat Clude recall as a lead to verify, not proof.
- Do not use Clude delete/update/list/batch/extract tools unless the user explicitly asks and the action is scoped.

## Lumi

Track local, committed, pushed, deployed/live state whenever this pilot changes. This repo has no deployment surface unless one is added later.
