# Pilot 001: Source-Backed Write

Type: internal dogfood report.

This is not an external pilot. It records one local workflow where Chainseal ran before a memory write.

## Question

```text
Will you run Chainseal before memory writes?
```

Internal answer for this workflow: yes. The command was fast, deterministic, and wrote only after source verification.

## Command

```bash
node bin/chainseal.mjs store /private/tmp/chainseal-pilots/good-candidate.json \
  --ledger /private/tmp/chainseal-pilots/receipts.jsonl \
  --project /private/tmp/chainseal-pilots/source
```

## Evidence

Result:

```text
ok: true
gate.decision: allow
verified source ref: docs/source.md:3-3
receipt fact_key: pilot.source_write
ledger: /private/tmp/chainseal-pilots/receipts.jsonl
```

What Chainseal allowed:

```text
Chainseal pilot workflows require source-backed memory writes.
```

Why it was allowed:

- source file existed;
- line range was inside the file;
- evidence status was verified;
- content was compact;
- content did not match secret, transcript, or instruction-injection patterns.

## Limitations

- This was a local internal workflow, not an external user pilot.
- The source ref was a local file only.
- No backend adapter was called; the write stopped at the receipt ledger.
