# Productization Roadmap

## Product

Final name: Chainseal.

Positioning: memory trust boundary for coding agents. Memory backends focus on storing and retrieving content; Chainseal decides whether memory is safe, sourced, current, and actionable before it enters or leaves a backend.

Tagline:

```text
Only trusted memory crosses the line.
```

## Wedge

Start with developers and teams already using coding agents heavily:

- coding-agent power users;
- teams adopting MCP tools;
- teams worried about prompt injection, stale memory, or secret leakage;
- agent builders who want memory without trusting raw transcript storage.

The first buyer-visible promise:

```text
Give your coding agent memory without letting memory become an unsourced, stale, or secret-bearing attack surface.
```

## MVP Distribution

Phase 1 ships as an npm CLI and skill pack:

- `chainseal gate candidate.json`
- `chainseal store candidate.json --ledger <receipts.jsonl>`
- `chainseal recall "query" --ledger <receipts.jsonl>`
- `chainseal audit --ledger <receipts.jsonl>`
- `chainseal schema candidate|receipt|adapter-contract`
- `chainseal adapter-contract`
- `chainseal mcp-descriptor`
- `chainseal canary /path/to/repo`
- source-backed memory candidate schema;
- local append-only receipt schema;
- replayable safety canaries;
- portable agent workflow wrapper.

No hosted service is required for the MVP.

## Product Tiers

### Free / Open Source

- CLI gate.
- Canary harness.
- Local docs and skill pack.
- Backend adapter contract.

### Pro Local

- Append-only receipt ledger.
- Recall broker that merges repo docs, task receipts, and configured memory stores.
- Stale-memory and contradiction audit.
- MCP descriptor drift audit.

### Team / Enterprise

- Team policy packs.
- CI checks for memory candidates.
- Central memory receipt dashboards.
- Provider-specific connectors with explicit secret boundaries.
- Audit exports for compliance and internal security review.

## Differentiators

- Source-truth-first: repo, git, CI, tests, provider state, and live URLs outrank memory.
- Memory firewall: unsafe candidates fail before storage.
- Temporal ledger: changed facts append validity events instead of overwriting.
- Recall packets: memory returns with trust tier, freshness, sensitivity, and required verification.
- MCP-safe posture: no hosted/remote memory or broad mutation tools by default.
- Coding-agent specific: built around files, commits, branches, tests, deploys, and Lumi hygiene.

## Distribution Checklist

Completed for public npm publish:

- Keep the package name, CLI, docs, and skill pack branded as Chainseal.
- Use descriptive compatibility copy instead of third-party product marks in the package name.
- Add repository URL after the remote exists.
- Run `npm test`.
- Run `npm run pack:dry` and inspect tarball contents.
- Run disposable-directory install test from the generated tarball.
- Confirm package/version availability.

Before broader public support:

- Keep public issue/security contact current.
- Keep threat model and proof playbook current.
- Expand adversarial fixture coverage before broader claims.

Before hosted product:

- Define data retention and deletion policy.
- Add explicit tenant boundaries.
- Add secret scanning at ingestion and before retrieval.
- Add audit logs and admin review queue.
- Add threat model for memory poisoning and prompt injection.
- Run external security review.

## Immediate Next Builds

1. Run three to five real pilot workflows and capture false positives, blocked examples, missing checks, and operator notes.
2. Add a contract compatibility harness before writing backend-specific adapters.
3. Expand audit for package, deploy, branch, and provider-state stale facts.
4. Add local MCP client examples without mutating global config.
5. Add richer fixture coverage for safe, poisoned, stale, contradictory, and secret-like memories.

## Launch Copy

Memory for coding agents, without the amnesia or the poison.

Chainseal gives agent memory a source-truth layer: every memory candidate is screened for secrets, transcripts, unsupported claims, and prompt-injection patterns before it reaches a backend. Recall comes back as evidence, not orders.
