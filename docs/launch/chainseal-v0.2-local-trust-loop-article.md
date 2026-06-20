# Chainseal Now Has a Real Local Trust Loop

Header artifact:

```text
docs/media/chainseal-article-header-5x2.png
```

AI agents are starting to remember more.

That sounds useful because it is. Memory lets an agent pick up context, avoid repeating itself, and carry project knowledge from one session to the next. But durable memory also creates a new attack surface.

What happens if the agent remembers the wrong thing?

What happens if it stores a secret by accident?

What happens if a poisoned instruction gets saved as memory and quietly comes back later?

What happens if an old memory is treated as truth after the source has changed?

That is the problem Chainseal is built for.

Chainseal is a source-backed memory firewall for coding agents. It sits between an agent and a memory backend. Before a memory gets stored, Chainseal checks whether the memory is compact, safe, and backed by a real source.

The v0.2.0 release is the first real proof loop.

The simple version:

- Chainseal checks a memory candidate.
- It blocks secrets, raw transcripts, source-free claims, and prompt-injection-shaped text.
- It verifies that file source refs actually exist.
- It stores allowed memories only when there is an explicit local receipt ledger.
- It recalls memory as a lead, not proof.
- It audits receipts for stale or unsafe entries.

That last distinction matters.

Memory should help an agent move faster. It should not become a hidden instruction system. Chainseal treats recall as evidence to verify before action, not as a command to obey.

v0.2.0 includes:

- candidate and receipt schemas;
- a reusable JavaScript library API;
- `chainseal store`;
- `chainseal recall`;
- `chainseal audit`;
- expanded canaries;
- a threat model;
- a proof playbook;
- a repo entry packet;
- a public project spine.

The project is intentionally local-first. There is no hosted service required for the proof release. The goal is to prove the trust loop before asking people to trust a broader system.

The roadmap is now public too:

- v0.2: local trust loop;
- v0.3: stronger source verification;
- v0.4: backend adapter contract;
- v0.5: recall broker hardening;
- v0.6: local MCP facade.

The next engineering target is v0.3: line-number source refs, file hash checks, moved-file diagnostics, and a fixture corpus for safe, poisoned, stale, and secret-like memories.

Chainseal is not trying to be another memory database.

It is the trust boundary in front of memory systems.

Only trusted memory crosses the line.

Links:

- npm: `chainseal@0.2.0`
- GitHub release: `https://github.com/williamclay8/chainseal/releases/tag/v0.2.0`
- Proof artifact: `docs/releases/v0.2.0-proof-release.md`
- Roadmap: `docs/project-spine.md`

