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

Write an allowed candidate to an explicit local receipt ledger:

```bash
chainseal store candidate.json --ledger ~/.chainseal/receipts.jsonl
```

Recall a trust-ranked packet from a local receipt ledger:

```bash
chainseal recall "source-backed memory" --ledger ~/.chainseal/receipts.jsonl
```

Audit a ledger for stale sources, source-missing receipts, secret-like content, and missing Lumi state:

```bash
chainseal audit --ledger ~/.chainseal/receipts.jsonl
```

Print the candidate or receipt schema:

```bash
chainseal schema candidate
chainseal schema receipt
chainseal schema adapter-contract
```

Inspect the backend-neutral adapter contract:

```bash
chainseal adapter-contract
```

Run adapter contract cases from a fixture file:

```bash
chainseal adapter-harness adapter-cases.json --project .
```

Inspect the local MCP facade descriptor:

```bash
chainseal mcp-descriptor
chainseal-mcp descriptor
```

Run the local MCP client example:

```bash
node examples/mcp-local-client.mjs
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
- `action.yml`: composite repo proof gate.

The local MCP facade exposes:

- `chainseal_propose_store`
- `chainseal_recall_packet`
- `chainseal_audit`
- `chainseal_receipt`

The MCP facade stays behind the same local proof gate as the CLI. It is a local stdio JSON-RPC surface, not a hosted memory service.

## GitHub Action

Use the composite proof gate from this repository to make Chainseal enforceable in another repo:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: williamclay8/chainseal@v0.3.0
```

The Action runs the Chainseal canary against the checked-out project.

## Backend Adapters

Chainseal sits in front of memory backends. Backends may store or retrieve content, but Chainseal owns the trust boundary: whether a candidate is safe, sourced, current, and actionable.

Use backend recall as a lead. Verify against repo files, tests, git, CI, provider state, or live URLs before acting.

## Safety

Read [SECURITY.md](SECURITY.md) before connecting Chainseal to hosted memory backends, remote MCP endpoints, vector databases, wallets, provider logs, or secret-bearing workflows.

For a compact repo entry packet, read [docs/repo-entry.md](docs/repo-entry.md). For the current threat model, read [docs/threat-model.md](docs/threat-model.md). For reproducible proof commands and expected outputs, read [docs/proof-playbook.md](docs/proof-playbook.md).

For proof releases, read [docs/releases/v0.2.0-proof-release.md](docs/releases/v0.2.0-proof-release.md) and [docs/releases/v0.3.0-proof-release.md](docs/releases/v0.3.0-proof-release.md). For the followable project spine, read [docs/project-spine.md](docs/project-spine.md).

For the current build surfaces, read [docs/v0.4/adapter-contract.md](docs/v0.4/adapter-contract.md), [docs/v0.5/recall-broker-hardening.md](docs/v0.5/recall-broker-hardening.md), and [docs/v0.6/local-mcp-facade.md](docs/v0.6/local-mcp-facade.md).

For evidence capture, read [docs/pilots/README.md](docs/pilots/README.md). Pilot reports should show real commands, outputs, limitations, and operator notes.

For launch copy and pilot asks, read [docs/launch/chainseal-v0.2-local-trust-loop-article.md](docs/launch/chainseal-v0.2-local-trust-loop-article.md), [docs/launch/manual-social-packet.md](docs/launch/manual-social-packet.md), and [docs/pilot-asks.md](docs/pilot-asks.md).

## Status

MVP package published on npm as `chainseal`.

Current build direction: keep Chainseal local-first, deterministic, source-backed, and backend-neutral. The near-term project is not a hosted memory service. It is the gate, receipt ledger, recall packet, and audit layer that makes existing memory systems safer to use.

v0.2.0 positioning:

```text
Chainseal now has a real local trust loop.
```

v0.3.0 proof release:

```text
Chainseal now verifies stronger source claims before memory crosses the line.
```

The current package includes stronger source verification, a backend-neutral adapter contract, recall broker hardening, a local MCP facade, and GitHub Action proof surfaces. Backend adapters and hosted services remain out of scope until real pilots prove the contract.

## Community Boundary

Any community-token or contract-address references around Chainseal are not security evidence, release authority, or product trust material. Chainseal's source of truth is the repository, npm package, signed release process when added, test/canary output, and documented security policy.
