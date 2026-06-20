# Chainseal Threat Model

## Scope

Chainseal protects the memory boundary around coding agents:

- what gets stored;
- what gets recalled;
- what evidence supports a memory;
- when memory requires review, recheck, or rejection.

The current implementation is local-only. It does not run a hosted service, remote MCP server, vector database, wallet connector, OAuth flow, or provider connector.

## Assets

- Source-backed project facts.
- Receipt-ledger history.
- Agent workflow rules.
- Memory candidates before storage.
- Recall packets before agent use.
- Lumi status for repo, package, and release state.

## Primary Risks

| Risk | Example | Chainseal Control |
| --- | --- | --- |
| Secret memory | API key-shaped text is stored forever | Secret-like pattern block |
| Raw transcript memory | Full user/assistant/tool context is saved | Transcript-shape block |
| Source-free claim | A model says a fact is true and stores it | Verified source-ref requirement |
| Stale memory | Old package, branch, deploy, or policy facts remain trusted | Audit and review-after receipts |
| Prompt injection | Memory says to ignore instructions or print secrets | Injection-shape block and recall-as-lead rule |
| Unscoped mutation | Agent deletes, lists, batches, or extracts memories without owner intent | `needs_review` for mutation actions |
| Backend overtrust | Vector recall is pasted as authoritative context | Recall packets require source verification before action |

## Trust Boundaries

Highest-trust sources:

- repo files;
- tests;
- git history;
- CI;
- provider/live state when explicitly checked;
- release receipts.

Lower-trust sources:

- cross-session memory;
- local associative recall;
- research receipts that have not been rechecked;
- model-generated summaries.

No-trust sources:

- secrets;
- raw transcripts;
- unsupported claims;
- prompt-injection-shaped content;
- unscoped mutation requests.

## Current Non-Goals

- Hosted memory service.
- Remote MCP service.
- Provider-specific connectors.
- Wallet or private-key workflows.
- Customer-data ingestion.
- Automatic delete/update/list/batch/extract memory mutation.

## Required Evidence Before Promotion

A memory should not cross the line unless it has:

- compact content;
- non-secret sensitivity;
- verified source references;
- verified/current evidence status;
- explicit target store;
- Lumi state when it comes from repo work;
- a receipt when written to a ledger.
