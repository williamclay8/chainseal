# Pilot Workflows

Use this page to run focused pilots before broad adoption.

## Pilot Question

```text
Will you run Chainseal before memory writes?
```

The first pilots should test whether the local trust loop is useful, understandable, and strict enough without blocking normal work.

## Who To Pilot With

Pick three to five people or teams already using:

- coding agents;
- local or hosted memory backends;
- custom agent memory flows;
- repo-aware assistants;
- agent orchestration scripts.

Do not chase broad adoption yet. The goal is learning, not logos.

## Pilot Setup

Give each pilot:

- `docs/repo-entry.md`;
- `docs/releases/v0.2.0-proof-release.md`;
- the candidate schema;
- the receipt schema;
- one safe candidate example;
- one blocked candidate example;
- one local ledger path;
- the canary command.

## What To Capture

For every pilot, capture:

- what they tried to store;
- what Chainseal allowed;
- what Chainseal blocked;
- whether the block was correct;
- false positives;
- false negatives;
- confusing CLI or docs language;
- missing source-ref needs;
- whether receipt output helped;
- whether recall felt like a lead instead of proof.

## Example Pilot Flow

1. Run the canary suite.
2. Gate a safe candidate with a real source file.
3. Gate a source-free or prompt-injection-shaped candidate.
4. Store the safe candidate into an explicit local ledger.
5. Recall from the ledger.
6. Audit the ledger.
7. Record the friction and missing checks.

## Exit Criteria

A pilot is useful when it produces at least one of:

- a real blocked unsafe memory;
- a false positive to tune;
- a missing check to build;
- a docs confusion to fix;
- a source-ref problem to support;
- a clearer adapter-contract requirement.

