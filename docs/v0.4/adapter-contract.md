# v0.4 Backend Adapter Contract

Status: local contract implemented, no backend adapters included.

Goal:

```text
Make Chainseal sit in front of any memory backend without owning that backend's storage model.
```

## Contract

Runtime version:

```text
chainseal.adapter.v1
```

Schema:

```bash
chainseal schema adapter-contract
```

Runtime descriptor:

```bash
chainseal adapter-contract
```

Library API:

```js
import { adapterContract, adapterWritePacket } from "chainseal";
```

## Write Packet

`adapterWritePacket(candidate, options)` returns:

- `ok`: whether Chainseal allowed the candidate;
- `contract`: versioned backend-neutral contract metadata;
- `operation`: `memory.write`;
- `fail_closed`: true when the gate blocks or needs review;
- `gate`: Chainseal decision packet;
- `receipt`: receipt preview when allowed, otherwise null;
- `backend_request`: normalized backend write request when allowed, otherwise null.

The important rule:

```text
backend_request is null unless Chainseal allows the candidate.
```

That gives adapter authors a simple integration rule: do not call the backend unless `backend_request` exists.

## Why No Adapters Yet

The project needs the contract to be boring before provider-specific adapters exist.

Adapters should come after pilots answer:

- Which backend surfaces actually need Chainseal first?
- Where do false positives happen?
- What metadata does a backend need beyond content and source refs?
- Which write failures need receipts?
- How should adapter errors be reported without leaking provider logs?

## Current Proof

The test suite proves:

- allowed candidates produce backend write packets;
- blocked candidates fail closed with `backend_request: null`;
- receipts carry `fact_key` for downstream audit and recall checks.

The canary proves:

```text
PASS: adapter contract schema is exposed
PASS: adapter contract is backend-neutral and versioned
```

## Next Work

- Add adapter-contract examples for common local-only memory flows.
- Add a contract compatibility test harness.
- Add backend error mapping without provider-specific code.
- Keep all backend credential and hosted surfaces outside the core package until reviewed.
