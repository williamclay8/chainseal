# Changelog

## 0.3.0 - 2026-06-20

- Added source-ref line range validation with `line`, `start_line`, and `end_line`.
- Added structured source diagnostics for hash mismatches and likely moved files.
- Added a fixture corpus for safe, poisoned, stale, and secret-like memory candidates.
- Expanded canaries for invalid line ranges, stale hashes, and moved-file diagnostics.
- Added the `chainseal.adapter.v1` backend-neutral adapter contract and fail-closed write packet API.
- Added recall freshness, review-after checks, fact-key contradiction checks, and hardened audit output.
- Added the `chainseal.mcp.local.v1` local stdio JSON-RPC facade and `chainseal-mcp` binary.
- Added a composite GitHub Action and proof workflow for repository enforcement.
- Added v0.3 proof release docs, v0.4-v0.6 project spine docs, and pilot report scaffolding.

## 0.2.0 - 2026-06-20

- Added a reusable Chainseal library API for candidate decisions, source-ref checks, receipt creation, ledger storage, audit, and recall packets.
- Added candidate and receipt JSON schemas.
- Added explicit `chainseal store`, `chainseal recall`, `chainseal audit`, and `chainseal schema` commands.
- Expanded canaries for missing source files, obfuscated prompt-injection text, explicit ledger writes, recall packets, audit, and schema exposure.
- Added a Node test suite around the core trust-boundary behavior.
- Added public trust scaffolding: security reporting, contribution guide, threat model, proof playbook, CI, and GitHub templates.

## 0.1.1

- Published the Chainseal npm package with CLI gate, canary, architecture docs, roadmap, security notes, and portable skill pack.
