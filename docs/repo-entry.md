# Chainseal Repo Entry

Use this page when entering the repo cold.

## What This Is

Chainseal is a source-backed memory firewall and trust boundary for coding agents.

It screens candidate memories before they reach a backend, records local receipts for allowed writes, and returns recall as leads that must be verified before action.

## Safety Boundaries

- Store only compact, source-backed, non-secret memories.
- Treat recall as a lead, not proof.
- Never pass wallet material, private keys, `.env` values, customer data, provider logs, OAuth URLs, or raw transcripts into memory tooling.
- Do not use delete/update/list/batch/extract memory tools unless the user explicitly asks and the action is scoped.
- Keep community funding references separate from trust claims. The proof surface is tests, canaries, receipts, source-backed behavior, security policy, and release discipline.

## Canonical Commands

Fastest local check:

```bash
npm test
```

Package proof check:

```bash
npm run pack:dry
```

Run the canary suite directly:

```bash
skills/chainseal/scripts/chainseal-canary.sh .
```

Validate one candidate:

```bash
chainseal gate candidate.json --project .
```

File source refs may include `line`, `start_line`, `end_line`, and `sha256`. Chainseal verifies that the file exists, the optional line range is inside the file, and the optional hash matches the current file contents.

Store one allowed candidate with an explicit ledger:

```bash
chainseal store candidate.json --ledger /tmp/chainseal-receipts.jsonl --project .
```

Recall from a local ledger:

```bash
chainseal recall "source-backed memory" --ledger /tmp/chainseal-receipts.jsonl --project .
```

Audit a local ledger:

```bash
chainseal audit --ledger /tmp/chainseal-receipts.jsonl --project .
```

Inspect the adapter contract and local MCP facade:

```bash
chainseal schema adapter-contract
chainseal adapter-contract
chainseal adapter-harness adapter-cases.json --project .
chainseal mcp-descriptor
chainseal-mcp descriptor
node examples/mcp-local-client.mjs
```

## Stronger Check

Before release work, run:

```bash
npm test
npm run pack:dry
git diff --check
```

Inspect the dry-run tarball contents before publishing. The tarball should include CLI, library API, schemas, docs, security policy, and skill pack, and should not include local secrets, temporary receipts, or private workspace artifacts.

## Release Surface

Chainseal currently has no hosted deployment surface.

Release surfaces:

- GitHub branch, PR, issues, tags, and release notes.
- npm package publish.

Do not call a release live until the intended public surface is verified. For npm releases, verify the published version after the registry accepts the package.

## Dirty-Tree Rule

If code, docs, release assets, or package metadata change, explicitly track:

- local state;
- committed state;
- pushed state;
- deployed/live state.

Never revert or discard dirty changes unless the user explicitly asks.
