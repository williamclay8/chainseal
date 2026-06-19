# Clude Adoption Guide For Codex

## Source Posture

Source-backed facts from the 2026-06-19 research pass:

- Clude publishes `@clude/sdk` on npm.
- Latest observed package version: `3.2.0`.
- Package metadata includes `mcpName: io.github.sebbsssss/clude`.
- Stdio MCP command: `npx @clude/sdk mcp-serve`.
- Remote MCP endpoint exists at `https://clude.io/api/mcp`.
- Remote endpoint requires bearer/OAuth auth.
- Clude's public docs and repo are inconsistent about versions, storage paths, and benchmark claims.

Decision: use a local pinned pilot first. Keep hosted/remote/self-hosted modes deferred.

## Do Not Run By Default

Avoid these unless Clay explicitly approves the exact surface:

```bash
npx @clude/sdk setup
npx @clude/sdk connect
npx @clude/sdk register
npx @clude/sdk init
npx @clude/sdk mcp-install
```

Reasons:

- May write Claude Desktop, Claude Code, Cursor, or project config.
- May create `~/.clude/config.json`.
- May register hosted Clude state or API keys.
- May inject instructions into `CLAUDE.md` or `AGENTS.md`.
- May create local data outside the current repo.

## Codex Pilot Command

Use:

```bash
codex mcp add clude-local -- npx -y @clude/sdk@3.2.0 mcp-serve --local
```

Why:

- Pins package version.
- Uses a distinct MCP name.
- Keeps storage local JSON.
- Avoids hosted credentials and Supabase.
- Avoids Clude's installer.

## Promotion Requirements

Promote beyond local pilot only if:

- The canary passes.
- Clude improves actual recall or workflow quality versus Supermemory alone.
- No secret or raw transcript storage occurs.
- Store/delete/update usage is bounded.
- Rollback is documented and tested.
- Lumi state is reported.

## Rollback

```bash
codex mcp remove clude-local
```

Do not delete `~/.clude` data without explicit approval.
