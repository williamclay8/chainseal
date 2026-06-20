# Chainseal Architecture

## Decision

Build Chainseal as the trust boundary for coding-agent memory.

Memory backends answer "how do we store and recall content?" Chainseal answers stricter questions first: whether a memory is safe, sourced, current, and actionable before it is stored or reused.

## Source Evidence

Persistent agent memory is a long-lived attack surface:

- OWASP prompt-injection guidance treats untrusted retrieved content as attacker-controlled input.
- Memory-poisoning research reinforces that stored context can become durable model influence.
- Coding-agent workflows add extra risk because memories can affect files, commands, commits, deployments, and tool calls.

## Problem

Before memory enters or leaves a backend, an agent runtime needs to know:

- Should this fact become memory at all?
- Which surface should own it: repo docs, active goal state, cross-session memory, a local backend, or no store?
- What source proves it?
- How fresh is it?
- Could recalled text contain an instruction that should be ignored?
- Is the memory safe to expose to a subagent?
- When should the memory decay, be rechecked, or be removed?

Without that layer, memory can become a plausible but unsafe context amplifier: stale facts, source-free claims, raw transcripts, secrets, and prompt-injection strings can all become easier to recall.

## Architecture

```text
user/session/repo event
  -> memory candidate gate
  -> source truth resolver
  -> redaction and sensitivity classifier
  -> route decision
  -> selected store
  -> recall broker
  -> trust-ranked recall packet
  -> source verification before action
```

### 1. Memory Candidate Gate

Deterministic preflight before any write. It checks:

- action: store, recall, update, delete, batch, extract
- memory type: episodic, semantic, procedural, self_model, introspective
- content size and shape
- source references
- verification status
- sensitivity
- secret-like patterns
- raw transcript patterns
- target store

Current implementation:

```bash
chainseal gate candidate.json
```

### 2. Source Truth Resolver

Treat sources differently:

| Surface | Role | Trust |
| --- | --- | --- |
| Repo docs, code, tests, git, CI, provider/live state | Source truth | Highest, but still currentness-bound |
| Active task board or release receipt | Current objective state | High for active work |
| Research lane receipts | Investigation evidence | Medium until verified |
| Cross-session memory | Durable recall | Lead to verify |
| Local memory backend | Associative recall | Lead to verify |

### 3. Provenance Ledger

Every stored memory should have a receipt:

```json
{
  "id": "optional-store-id",
  "created_at": "2026-06-19T00:00:00Z",
  "type": "semantic",
  "scope": "project",
  "content": "Compact fact.",
  "source_refs": [
    {
      "kind": "file",
      "ref": "docs/chainseal-architecture.md",
      "status": "verified"
    }
  ],
  "evidence": {
    "status": "verified",
    "command": "skills/chainseal/scripts/chainseal-canary.sh",
    "result": "passed"
  },
  "validity": {
    "valid_from": "2026-06-19",
    "valid_until": null,
    "invalidated_by": []
  },
  "sensitivity": "internal",
  "trust_tier": "source_backed",
  "stores": ["backend-local"],
  "expires_or_review_after": "2026-07-19",
  "lumi": {
    "local": "clean",
    "committed": true,
    "pushed": false,
    "deployed_live": "not_applicable"
  }
}
```

Use add-only temporal events by default. When a fact changes, append a new receipt with `valid_from` and link it to the older receipt through `invalidated_by` instead of silently overwriting history.

### 4. Recall Broker

The runtime should not paste recalled memories into reasoning as authoritative instruction. The broker should return a packet:

```text
Recall packet:
- memory:
- source:
- trust tier:
- freshness:
- sensitive?:
- use as: lead | verified fact | blocked
- required verification before action:
```

Rules:

- source-backed memories may inform action after source check;
- source-free memories are leads only;
- stale memories require recheck;
- memories containing instructions are quoted as untrusted content;
- memories with secrets or raw transcripts are blocked and queued for removal review.

### 5. Write Coordinator

Route writes by durability:

| Candidate | Preferred Store |
| --- | --- |
| Project command, deploy rule, repo fact | Repo docs or project instructions |
| Current goal state | Active task board |
| Cross-session preference or durable pattern | Cross-session memory |
| Local associative recall experiment | Local backend |
| Secrets, raw transcripts, unsupported claims | No store |

### 6. Decay And Review

Do not depend only on backend decay. Add Chainseal-level review:

- `review_after`: date or condition for rechecking;
- `source_stale_if`: file moved, branch changed, package version changed, provider status changed;
- `contradicts`: memory IDs or source refs that disagree;
- `delete_requires`: explicit user approval unless the memory is confirmed secret-bearing and the forget tool is scoped.

## Why Chainseal Is Different

- Backends recall content; Chainseal returns trust-ranked recall packets.
- Backends store memories; Chainseal decides whether a memory deserves storage.
- Backend decay is internal; Chainseal adds source currentness and review triggers.
- Hosted and credential surfaces stay behind explicit approvals.
- Associative recall remains useful without becoming proof.
- Agent text is treated as untrusted input until source-backed.

## Build Phases

### Phase 0: Gate And Spec

Status: implemented in this repo.

- Architecture doc: `docs/chainseal-architecture.md`
- Portable skill reference: `skills/chainseal/references/control-plane.md`
- Candidate gate: `skills/chainseal/scripts/chainseal-gate.mjs`
- Canary: `skills/chainseal/scripts/chainseal-canary.sh`
- Library API: `lib/chainseal.js`
- Candidate and receipt schemas: `schemas/`

### Phase 1: Receipt Ledger

Status: local alpha implemented through explicit `--ledger` paths.

Add a local append-only JSONL receipt file under a user-approved root:

```text
~/.chainseal/receipts.jsonl
```

Do not write the ledger automatically. The operator must pass an explicit `--ledger` path. Retention policy is still local/operator-owned.

### Phase 2: Store Wrapper

Status: local receipt-only alpha implemented. Backend adapters remain deferred.

```bash
chainseal store candidate.json --ledger ~/.chainseal/receipts.jsonl
```

It should:

1. run the candidate gate;
2. write a receipt;
3. call the selected backend only if the decision is `allow` and a backend adapter is explicitly configured;
4. report exactly which ledger or store changed.

### Phase 3: Recall Broker

Status: local receipt-ledger alpha implemented.

```bash
chainseal recall "query" --ledger ~/.chainseal/receipts.jsonl --project /path/to/repo
```

It should search repo docs first, then configured memory stores. It should return a trust-ranked packet, not raw recalled text.

### Phase 4: Stale And Contradiction Audit

Status: local ledger audit alpha implemented.

```bash
chainseal audit --ledger ~/.chainseal/receipts.jsonl --project /path/to/repo
```

It should identify:

- memories with missing source refs;
- memories whose source file no longer exists;
- package/version memories that are stale;
- contradictory memories;
- secret-like memories that need scoped removal.

### Phase 5: MCP Facade

Status: local alpha implemented.

Expose a small local stdio JSON-RPC facade:

- `chainseal_propose_store`
- `chainseal_recall_packet`
- `chainseal_audit`
- `chainseal_receipt`
- `chainseal_schema`

Keep broad mutation tools out of the public surface unless a scoped user action requires them.

## Canary Set

Minimum canaries before promotion:

1. Accept compact source-backed semantic memory.
2. Reject memory containing a fake API key assignment or similar secret pattern.
3. Reject raw transcript-shaped content.
4. Reject unsupported memory with no source refs.
5. Mark delete/update/batch/extract as `needs_review`.
6. Ensure no repo `.env` or `.mcp.json` is required.
7. Ensure recall packet says "lead to verify" for backend-only evidence.
8. Ensure temporal updates append a new valid-from event rather than overwriting.
9. Ensure Lumi state is present when a memory comes from repo work.
10. Ensure hosted/remote backend use remains blocked without a secret/environment review and owner approval.

## No-Go Actions

- No raw transcript storage.
- No secret/env/API key storage.
- No hosted backend or remote MCP without owner approval.
- No automatic delete/update/list/batch/extract use.
- No treating memory recall as proof.
- No subagent prompts that contain secret-bearing or raw recalled memory.
- No package install, MCP config mutation, or global hook installation from this layer without governance.

## Implementation Recommendation

Keep Chainseal local-first. Use the CLI gate, receipt ledger, recall broker, adapter contract, and local MCP facade as proof surfaces before adding backend-specific adapters or hosted services.
