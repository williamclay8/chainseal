# Chainseal Project Spine

Chainseal should be easy to follow without reading every commit.

The project spine is the public path from a local proof loop to a durable memory-trust layer for coding agents.

## North Star

Chainseal is not a memory database.

Chainseal is the trust boundary in front of memory systems: it decides whether a memory is safe, sourced, current, and actionable before it is stored or reused.

## Roadmap

### v0.2: Local Trust Loop

Status: proof release.

Scope:

- candidate and receipt schemas;
- reusable library API;
- local `store`, `recall`, and `audit` commands;
- source-ref checks;
- receipt ledger;
- canary suite;
- threat model;
- proof playbook.

Proof target:

- show exactly what Chainseal blocks, allows, records, recalls, audits, and packages.

### v0.3: Stronger Source Verification

Status: in progress.

Scope:

- line-number source refs;
- optional file hashes;
- better diagnostics for missing, renamed, or moved files;
- source-ref fixture coverage.

Proof target:

- demonstrate that stale or moved source claims are caught without making normal repo edits painful.

### v0.4: Backend Adapter Contract

Scope:

- stable interface for backend memory stores;
- no backend-specific adapters yet;
- explicit inputs, outputs, trust decisions, receipt requirements, and failure modes.

Proof target:

- prove that Chainseal can sit in front of different memory backends without owning their storage model.

### v0.5: Recall Broker Hardening

Scope:

- stronger recall packet ranking;
- stale fact detection;
- contradiction audit;
- review-after handling;
- source-before-action enforcement.

Proof target:

- show that recall improves agent usefulness without becoming hidden trusted context.

### v0.6: Local MCP Facade

Scope:

- local-only facade for propose-store, recall-packet, audit, and receipt workflows;
- no hosted memory service;
- fail-closed tool behavior;
- CLI parity tests.

Proof target:

- prove that agent runtimes can call Chainseal locally while preserving the same trust loop as the CLI.

## Pilot Loop

Run three to five real workflows before chasing broad adoption.

Pilot goal:

```text
Will you run Chainseal before memory writes?
```

Capture:

- false positives;
- missing checks;
- confusing docs;
- real blocked memory examples;
- source-ref friction;
- receipt/audit usefulness;
- places where recall was too trusting or too noisy.

## Public Content Rhythm

Publish small, proof-first explanations:

- Memory poisoning example of the week.
- What Chainseal blocks.
- Why memory should be a lead, not proof.
- How to safely give agents memory.
- Receipts over hidden context.

The point is not hype. The point is to make the trust problem legible to normal people and serious builders.

## Credibility Rule

Keep funding separate from trust.

Community funding can help the project exist. It is not security evidence, release authority, or proof that Chainseal works.

The proof is:

- tests;
- canaries;
- receipts;
- source-backed behavior;
- security policy;
- repeatable release artifacts;
- disciplined local/committed/pushed/live tracking.
