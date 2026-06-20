# Pilot 003: Recall Review Loop

Type: internal dogfood report.

This workflow tested whether recall stays useful without becoming proof when two receipts disagree.

## Commands

```bash
node bin/chainseal.mjs audit \
  --ledger /private/tmp/chainseal-pilots/recall-ledger.jsonl \
  --project /private/tmp/chainseal-pilots/source
```

```bash
node bin/chainseal.mjs recall "Recall output" \
  --ledger /private/tmp/chainseal-pilots/recall-ledger.jsonl \
  --project /private/tmp/chainseal-pilots/source
```

## Evidence

Audit result:

```text
ok: false
receipts_checked: 2
contradiction fact_key: pilot.recall_surface
review-after issue: 2026-06-01
```

Recall result:

```text
use_as: lead
first match: pilot-current
first freshness: current
first requires_review: true
second match: pilot-old
second freshness: review_due
```

Contradictory receipt contents:

```text
Recall output can be treated as proof.
Recall output is a lead until source verification.
```

## Why It Matters

The useful memory was ranked first, but Chainseal still marked it for review because another receipt with the same `fact_key` disagreed.

That is the right posture: memory can help an agent look in the right direction, but source verification still decides.

## Limitations

- Contradiction detection is fact-key based, not semantic reasoning.
- The ledger was synthetic and local.
- This does not replace real user pilots.
