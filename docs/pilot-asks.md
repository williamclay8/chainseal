# Chainseal Pilot Asks

Use these messages to run three to five focused pilots.

## Ask 1: Agent Builder

```text
I just cut Chainseal v0.2.0.

It is a local memory firewall for coding agents: gate -> receipt -> recall-as-lead -> audit.

Would you be willing to run Chainseal before memory writes in one real workflow and tell me what it blocks, what it misses, and what feels annoying?

I am not looking for broad adoption yet. I want pilot feedback on false positives, missing checks, and whether the receipt/recall model makes sense.
```

## Ask 2: Heavy Coding-Agent User

```text
Quick ask: will you try Chainseal on one project where you use agent memory or recurring agent context?

The goal is simple:

Run Chainseal before memory writes and see whether it catches unsafe, stale, source-free, or prompt-injection-shaped memories.

What I need back:

- one allowed example;
- one blocked example;
- anything confusing in the docs or CLI;
- whether recall-as-a-lead feels right.
```

## Ask 3: Memory Backend / Agent Infra Person

```text
I am testing Chainseal as the trust layer in front of agent memory systems.

It is not trying to be a memory database. It decides whether a memory is safe, sourced, current, and actionable before storage or recall.

Would you review the v0.2.0 local trust loop and tell me whether the adapter contract direction makes sense?

The specific question:

Would you run this before memory writes, and what would your backend need from the Chainseal receipt/recall packet?
```

## What To Record

For each pilot, record:

- project type;
- memory backend or workflow shape;
- candidate that passed;
- candidate that blocked;
- false positive;
- false negative;
- confusing docs or commands;
- source-ref friction;
- next check to build.

