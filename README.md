CA: 6QZ3PB6e1HuQATvryeCUqrp1Jecf8RVb9fMQzBhpump

# Chainseal

Only trusted memory crosses the line.

Chainseal is a source-backed memory firewall for coding agents. It screens memory candidates before they reach a backend, blocks unsafe or unsupported content, and treats recall as evidence to verify instead of instructions to obey.

## Why

Agent memory is not just storage. It is a durable attack surface.

Chainseal blocks:

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

From npm:

```bash
npm install chainseal
```

or:

```bash
npx chainseal --help
```

## CLI

Validate a candidate memory:

```bash
chainseal gate candidate.json
```

or:

```bash
chainseal-gate candidate.json
```

Run the canary suite:

```bash
chainseal canary /path/to/repo
```

or:

```bash
chainseal-canary /path/to/repo
```

Candidate example:

```json
{
  "action": "store",
  "type": "semantic",
  "content": "Chainseal requires source-backed memories before storage.",
  "source_refs": [
    { "kind": "file", "ref": "docs/chainseal-architecture.md", "status": "verified" }
  ],
  "evidence": { "status": "verified" },
  "sensitivity": "internal",
  "target_store": "backend-local",
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

- `chainseal-gate`: deterministic pre-store policy.
- `chainseal-canary`: replayable safety checks.
- `skills/chainseal`: portable agent workflow wrapper and references.
- `docs/chainseal-architecture.md`: architecture and roadmap.

The next product step is a local MCP facade exposing:

- `chainseal_propose_store`
- `chainseal_recall_packet`
- `chainseal_audit`
- `chainseal_receipt`

## Backend Adapters

Chainseal sits in front of memory backends. Backends may store or retrieve content, but Chainseal owns the trust boundary: whether a candidate is safe, sourced, current, and actionable.

Use backend recall as a lead. Verify against repo files, tests, git, CI, provider state, or live URLs before acting.

## Safety

Read [SECURITY.md](SECURITY.md) before connecting Chainseal to hosted memory backends, remote MCP endpoints, vector databases, wallets, provider logs, or secret-bearing workflows.

## Status

MVP package published on npm as `chainseal`.
