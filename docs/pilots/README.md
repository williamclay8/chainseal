# Chainseal Pilot Reports

This directory is for evidence, not marketing.

Do not claim an external pilot happened until a real operator runs Chainseal in a real workflow and reports what happened.

## Pilot Question

```text
Will you run Chainseal before memory writes?
```

## What To Capture

Each report should include:

- workflow and agent/runtime surface;
- Chainseal command used;
- what Chainseal allowed;
- what Chainseal blocked;
- false positives;
- missing checks;
- confusing docs;
- whether the operator would keep the gate in the loop;
- proof output or redacted receipt snippets.

## Current Reports

- [000 Chainseal Self-Hosted Proof](000-chainseal-self-hosted-proof.md): internal repo proof loop for this release branch.
- [001 Source-Backed Write](001-source-backed-write.md): internal workflow proving explicit-ledger storage after source verification.
- [002 Adapter Harness Block](002-adapter-harness-block.md): internal workflow proving blocked candidates do not produce backend write requests.
- [003 Recall Review Loop](003-recall-review-loop.md): internal workflow proving recall and audit surface review-due contradictions.

External pilot slots are intentionally empty until real users run them.

## Reporting Rule

Receipts beat hype.

If a report cannot show a command, output summary, blocked example, limitation, or operator note, it is not a pilot report yet.
