# v0.5 Recall Broker Hardening

Status: local receipt-ledger hardening implemented.

Goal:

```text
Let memory help agents without letting memory become hidden trusted context.
```

## What Changed

Receipts now support a `fact_key` field.

Use `fact_key` for one fact family:

```json
{
  "fact_key": "chainseal.release_surface",
  "content": "Chainseal release surface is GitHub and npm."
}
```

When receipts share a `fact_key` but disagree in content, Chainseal flags them as contradictory. That does not automatically delete anything. It marks the memory as needing review.

## Freshness

Recall matches now include:

- `freshness`: `current`, `review_due`, or `stale`;
- `review_after`: the receipt review date;
- `requires_review`: true when the match is stale, review-due, or contradictory.

Audit flags:

- review-after dates that have passed;
- validity windows that expired;
- receipts invalidated by later receipts;
- contradictory fact keys.

## Recall Rule

Recall is still a lead.

The packet continues to say:

```text
Verify recalled memories against their source_refs, repo files, tests, git, CI, provider state, or live URLs before acting.
```

## Current Proof

The test suite proves:

- fresh receipts sort before review-due receipts;
- contradictory fact keys surface in recall packets;
- audit emits review-after and contradiction issues.

The canary proves:

```text
PASS: audit flags review-after dates and contradictions
PASS: recall ranks freshness and marks contradictions for review
```

## Known Limits

- Contradiction checks are fact-key based, not semantic entailment.
- Review-after dates are local date checks, not source-aware provider checks.
- Recall search is simple substring matching over receipt content and source refs.
- Source-before-action remains an operator/runtime responsibility.

## Next Work

- Add stale package/version/deploy fact detectors.
- Add review-after policy presets.
- Add source-ref hash drift checks inside audit reports.
- Add a richer fixture corpus for safe, poisoned, stale, secret-like, and contradictory memories.
