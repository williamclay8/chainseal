# Codex Memory Control Plane

## Decision

Build a Codex-native memory control plane above Clude instead of trusting Clude as the control layer.

Clude is useful as a local memory backend and MCP target. Codex needs a stricter layer in front of it: source truth, provenance, redaction, trust scoring, lifecycle gates, and replayable canaries.

## Source Evidence

Observed on 2026-06-19:

- `npm view @clude/sdk version` returned `3.2.0`.
- `npm view @clude/sdk name version dist-tags.latest repository.url bin mcpName --json` returned package `@clude/sdk`, latest `3.2.0`, bin `clude`, repo `git+https://github.com/sebbsssss/clude.git`, and MCP name `io.github.sebbsssss/clude`.
- `https://clude.io/install` describes `npx @clude/sdk setup`, manual MCP config, `~/.clude/config.json`, `~/.clude/brain.db`, and tools such as `store_memory`, `recall_memories`, and `get_memory_stats`.
- `https://clude.io/docs.html` describes four MCP tools: `store_memory`, `recall_memories`, `get_memory_stats`, and `find_clinamen`; five memory types; decay; hybrid recall; dream cycles; and hosted, self-hosted, and local modes.
- `https://raw.githubusercontent.com/sebbsssss/clude/main/package.json` describes Clude as a persistent memory SDK using Supabase/pgvector, includes local SQLite-related dependencies, and includes model/provider, Solana, Privy, Supabase, and Twitter-related dependencies.
- Clude public surfaces disagree on some currentness details: docs show v3.0.1, package metadata shows v3.2.0, and tool counts differ between docs, changelog, and local/remote MCP descriptions. Treat Clude docs as implementation leads and package/runtime canaries as stronger current evidence.
- OWASP LLM01 prompt injection guidance treats untrusted retrieved content as a prompt-injection surface. Persistent memory makes that risk durable because bad content can be recalled later.
- Recent memory-poisoning research reinforces the same lesson: persistent memory is not just storage, it is a long-lived attack surface.

## Problem

Clude answers "how do we store and recall memories?" Codex needs to answer stricter questions first:

- Should this fact become memory at all?
- Which store should own it: repo docs, GoalBuddy, Supermemory, Clude, or no store?
- What source proves it?
- How fresh is it?
- Could recalled text contain an instruction that should be ignored?
- Is the memory safe to expose to a subagent?
- When should the memory decay, be rechecked, or be removed?

Without that layer, Clude can become a plausible but unsafe context amplifier: stale facts, source-free claims, raw transcripts, secrets, and prompt-injection strings can all be made easier to recall.

## Architecture

```text
user/session/repo event
  -> memory candidate gate
  -> source truth resolver
  -> redaction and sensitivity classifier
  -> route decision
  -> selected store(s)
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
node skills/clude-codex-memory/scripts/codex-memory-gate.mjs candidate.json
```

### 2. Source Truth Resolver

Treat stores differently:

| Surface | Role | Trust |
| --- | --- | --- |
| Repo docs, code, tests, git, CI, provider/live state | Source truth | Highest, but still currentness-bound |
| GoalBuddy board | Active goal truth | High for current objective state |
| Full Blast lane receipts | Research and integration evidence | Medium until verified |
| Supermemory | Cross-session recall | Lead to verify |
| Clude | Local persistent recall backend | Lead to verify |

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
      "ref": "docs/clude-codex-pilot.md",
      "status": "verified"
    }
  ],
  "evidence": {
    "status": "verified",
    "command": "skills/clude-codex-memory/scripts/clude-codex-canary.sh",
    "result": "passed"
  },
  "validity": {
    "valid_from": "2026-06-19",
    "valid_until": null,
    "invalidated_by": []
  },
  "sensitivity": "internal",
  "trust_tier": "source_backed",
  "stores": ["clude-local"],
  "expires_or_review_after": "2026-07-19",
  "lumi": {
    "local": "clean",
    "committed": true,
    "pushed": false,
    "deployed_live": "not_applicable"
  }
}
```

Use add-only temporal events by default. When a fact changes, append a new
receipt with `valid_from` and link it to the older receipt through
`invalidated_by` instead of silently overwriting history.

### 4. Recall Broker

Codex should not paste recalled memories into its reasoning as authoritative instruction. The broker should return a packet:

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
| Project command, deploy rule, repo fact | Repo docs or `AGENTS.md` |
| Current goal state | GoalBuddy board |
| Cross-session preference or durable pattern | Supermemory, optionally Clude |
| Local associative recall experiment | Clude local |
| Secrets, raw transcripts, unsupported claims | No store |

### 6. Decay And Review

Do not depend only on Clude's internal decay. Add Codex-level review:

- `review_after`: date or condition for rechecking;
- `source_stale_if`: file moved, branch changed, package version changed, provider status changed;
- `contradicts`: memory IDs or source refs that disagree;
- `delete_requires`: explicit user approval unless the memory is confirmed secret-bearing and the forget tool is scoped.

## Why This Is Better Than Clude Alone

- Clude recalls content; the control plane returns trust-ranked recall packets.
- Clude stores memories; the control plane decides whether the memory deserves storage.
- Clude has decay; the control plane adds source currentness and review triggers.
- Clude can be local/hosted/self-hosted; the control plane keeps hosted and credential surfaces gated.
- Clude can surface surprising associations; the control plane prevents `find_clinamen` from becoming proof.
- Clude can store from agent text; the control plane rejects raw transcripts, secrets, unsupported claims, and prompt-injection-shaped memories.

## Build Phases

### Phase 0: Gate And Spec

Status: implemented in this repo.

- Architecture doc: `docs/codex-memory-control-plane.md`
- Portable skill reference: `skills/clude-codex-memory/references/control-plane.md`
- Candidate gate: `skills/clude-codex-memory/scripts/codex-memory-gate.mjs`
- Canary: `skills/clude-codex-memory/scripts/codex-memory-control-plane-canary.sh`

### Phase 1: Receipt Ledger

Add a local append-only JSONL receipt file, probably under a global user-owned root rather than every repo:

```text
~/.agents/memory-control/receipts.jsonl
```

Do not write the ledger automatically until owner approval decides the path and retention policy.

### Phase 2: Store Wrapper

Build a wrapper command:

```bash
codex-memory store candidate.json --target clude-local
```

It should:

1. run the candidate gate;
2. write a receipt;
3. call Clude only if the decision is `allow`;
4. report exactly which store changed.

### Phase 3: Recall Broker

Build:

```bash
codex-memory recall "query" --project /path/to/repo
```

It should search repo docs first, then Supermemory, then Clude. It should return a trust-ranked packet, not raw recalled text.

### Phase 4: Stale And Contradiction Audit

Build:

```bash
codex-memory audit --project /path/to/repo
```

It should identify:

- memories with missing source refs;
- memories whose source file no longer exists;
- package/version memories that are stale;
- contradictory memories;
- secret-like memories that need scoped removal.

### Phase 5: MCP Facade

Only after the CLI proves useful, expose a small local MCP facade:

- `codex_memory_propose_store`
- `codex_memory_recall_packet`
- `codex_memory_audit`
- `codex_memory_receipt`

This should wrap Clude rather than replacing it, and should never expose delete/update/batch/extract tools without explicit scoped user intent.

## Canary Set

Minimum canaries before promotion:

1. Accept compact source-backed semantic memory.
2. Reject memory containing a `CORTEX_API_KEY` assignment or similar secret patterns.
3. Reject raw transcript-shaped content.
4. Reject unsupported memory with no source refs.
5. Mark delete/update/batch/extract as `needs_review`.
6. Ensure Clude local MCP is pinned to `@clude/sdk@3.2.0`.
7. Detect Clude MCP descriptor or command drift before trusting tools.
8. Ensure no repo `.env` or `.mcp.json` is required.
9. Ensure recall packet says "lead to verify" for Clude/Supermemory-only evidence.
10. Ensure temporal updates append a new valid-from event rather than overwriting.
11. Ensure Lumi state is included when a memory comes from repo work.
12. Ensure hosted/remote Clude remains blocked without `secret-env-safety-audit` and owner approval.

## No-Go Actions

- No raw transcript storage.
- No secret/env/API key storage.
- No hosted Clude or remote MCP without owner approval.
- No automatic delete/update/list/batch/extract use.
- No treating memory recall as proof.
- No subagent prompts that include secret-bearing or raw recalled memory.
- No package install, MCP config mutation, or global hook installation from this layer without governance.

## Implementation Recommendation

Keep the current Clude pilot as the backend experiment. Build the Codex Memory Control Plane as Clay-owned local scripts and skill references first. Promote to a local MCP facade only after the gate, receipt ledger, and recall broker prove useful with canaries.
