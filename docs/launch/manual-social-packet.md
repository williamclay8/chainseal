# Chainseal Manual Social Packet

Use this as copy-only launch material. Do not post from automation without explicit human action.

## Core Narrative

```text
Chainseal now has a real local trust loop.
```

Supporting line:

```text
Memory should help agents, not become hidden trusted context.
```

Proof CTA:

```text
The proof is the canary output, receipt ledger, schemas, tests, threat model, proof playbook, GitHub release, and npm package.
```

## X Thread Draft

```text
Chainseal v0.2.0 is live.

The simple version:

AI agents are starting to remember things.

That is powerful, but it creates a new problem:

What if the agent remembers the wrong thing?
```

```text
Chainseal is a memory firewall for coding agents.

Before a memory gets stored, it checks whether the memory is compact, safe, source-backed, and worth trusting.
```

```text
v0.2.0 adds the first real local trust loop:

- schemas
- library API
- store
- recall
- audit
- canaries
- threat model
- proof playbook
```

```text
Chainseal blocks:

- secret-like content
- raw transcripts
- source-free claims
- prompt-injection-shaped memories
- missing source files
- unscoped mutation actions
```

```text
Recall is intentionally not treated as truth.

Chainseal returns memory as a lead that must be verified against the source before action.

Memory should help agents move faster, not become hidden trusted context.
```

```text
The direction is public now:

v0.3: stronger source verification
v0.4: backend adapter contract
v0.5: recall broker hardening
v0.6: local MCP facade

Only trusted memory crosses the line.
```

## Short X Post

```text
Chainseal v0.2.0 is live.

It now has a real local trust loop for agent memory:

gate -> receipt -> recall-as-lead -> audit

Memory should help agents, not become hidden trusted context.
```

## LinkedIn Draft

```text
Chainseal v0.2.0 is live.

The release turns Chainseal from a simple memory gate into a local trust loop for coding agents: candidate schemas, a library API, store/recall/audit commands, canaries, a threat model, and a proof playbook.

The important idea is plain: agent memory should be useful, but it should not become hidden trusted context. Chainseal blocks unsafe memory writes, records receipts for allowed writes, and returns recalled memory as a lead that must be verified before action.
```

## Article CTA

```text
Read the proof release, run the canaries, and try placing Chainseal before memory writes.
```

