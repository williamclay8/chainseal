# Codex Memory Control Plane

Source-backed memory firewall and control plane for coding agents.

Clude made agent memory easy to distribute. This project makes memory safer for coding agents: every memory candidate is screened before it reaches Clude, Supermemory, or another store, and every recall is treated as a lead until source truth verifies it.

## Why

Agent memory is not just storage. It is a durable attack surface.

This package adds a deterministic layer that blocks:

- secret-like strings;
- raw transcript-shaped content;
- unsupported or source-free claims;
- prompt-injection-shaped memories;
- unscoped delete/update/list/batch/extract actions.

It also defines the product architecture for trust-ranked recall packets, source-backed receipts, temporal validity, and repo-first truth.

## Install

Local checkout:

```bash
npm install
npm test
```

After publishing:

```bash
npx codex-memory-control-plane gate candidate.json
```

or:

```bash
npx -p codex-memory-control-plane codex-memory-gate candidate.json
```

## CLI

Validate a candidate memory:

```bash
codex-memory gate candidate.json
```

or:

```bash
codex-memory-gate candidate.json
```

Run the canary suite:

```bash
codex-memory canary /path/to/repo
```

or:

```bash
codex-memory-canary /path/to/repo
```

Candidate example:

```json
{
  "action": "store",
  "type": "semantic",
  "content": "Clude local pilot is pinned to @clude/sdk@3.2.0 and uses mcp-serve --local.",
  "source_refs": [
    { "kind": "file", "ref": "docs/clude-codex-pilot.md", "status": "verified" }
  ],
  "evidence": { "status": "verified" },
  "sensitivity": "internal",
  "target_store": "clude-local",
  "lumi": {
    "local": "clean",
    "committed": true,
    "pushed": false,
    "deployed_live": "not_applicable"
  }
}
```

## Product Shape

The first distributable product is a local CLI and skill pack:

- `codex-memory-gate`: deterministic pre-store policy.
- `codex-memory-canary`: replayable safety checks.
- `skills/clude-codex-memory`: Codex skill wrapper and references.
- `docs/codex-memory-control-plane.md`: architecture and roadmap.

The next product step is a local MCP facade exposing:

- `codex_memory_propose_store`
- `codex_memory_recall_packet`
- `codex_memory_audit`
- `codex_memory_receipt`

## Relationship To Clude

Clude remains a memory backend. This project is the control plane in front of it.

Use Clude for local persistent recall after the gate has accepted a compact, source-backed memory. Do not use Clude recall as proof; verify against repo files, tests, git, CI, provider state, or live URLs before acting.

## Safety

Read [SECURITY.md](SECURITY.md) before connecting this to hosted Clude, remote MCPs, Supabase, wallets, provider logs, or secret-bearing workflows.

## Status

MVP local package. Not published yet.
