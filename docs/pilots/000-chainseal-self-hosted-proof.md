# Pilot 000: Chainseal Self-Hosted Proof

Type: internal dogfood report.

This is not an external pilot. It records Chainseal being used against its own repository while preparing v0.3.0.

## Workflow

Repository:

```text
williamclay8/chainseal
```

Branch:

```text
codex/chainseal-v0.3-source-verification
```

Purpose:

```text
Prove stronger source verification, adapter contract, recall broker hardening, local MCP facade, and CI enforcement surfaces before publishing.
```

## Commands

```bash
npm test
npm run pack:dry
git diff --check
```

## Evidence

Final evidence is recorded after the verification pass.

```text
npm test: passed
node:test: 16 passed, 0 failed
canary: 24 PASS lines, 0 FAIL lines
npm run pack:dry: passed
dry-run tarball: chainseal-0.3.0.tgz
package size: 35.9 kB
unpacked size: 126.2 kB
total files: 40
Action-shape canary simulation: passed against /private/tmp/chainseal-action-test
```

## What It Blocked

The canary blocks:

- secret-like memory;
- raw transcript-shaped memory;
- unsupported/source-free memory;
- instruction-injection-shaped memory;
- obfuscated instruction-injection-shaped memory;
- missing source files;
- invalid source line ranges;
- stale source hashes;
- unscoped mutation actions.

## What It Proved

- Source refs can be checked against local files, lines, and optional hashes.
- Missing source refs can return moved-file hints.
- Adapter packets fail closed before backend writes.
- Recall marks review-due and contradictory receipts.
- The local MCP facade preserves the same fail-closed posture.
- GitHub Action metadata can run the canary as a repo proof gate.

## Limitations Found

- No external operator feedback yet.
- Contradiction detection is fact-key based, not semantic.
- URL and provider refs are still not fully rechecked locally.
- No backend adapters are included.

## Next Pilot Target

Run Chainseal in three to five real memory-write workflows and capture:

- false positives;
- missing checks;
- blocked memory examples;
- whether the operator keeps Chainseal before memory writes.
