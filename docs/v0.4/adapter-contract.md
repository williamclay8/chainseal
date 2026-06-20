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
import { adapterContract, adapterContractHarness, adapterWritePacket } from "chainseal";
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
- receipts carry `fact_key` for downstream audit and recall checks;
- the adapter harness calls a backend writer only for allowed packets.

The canary proves:

```text
PASS: adapter contract schema is exposed
PASS: adapter contract is backend-neutral and versioned
PASS: adapter harness proves fail-closed cases
```

## Harness

Run fixture cases:

```bash
chainseal adapter-harness adapter-cases.json --project .
```

Fixture shape:

```json
{
  "cases": [
    {
      "name": "source-backed allow",
      "expect": "allow",
      "candidate": {
        "action": "store",
        "type": "semantic",
        "content": "Compact sourced fact.",
        "source_refs": [
          { "kind": "file", "ref": "docs/source.md", "status": "verified" }
        ],
        "evidence": { "status": "verified" },
        "sensitivity": "internal",
        "target_store": "backend-local"
      }
    }
  ]
}
```

Library harness:

```js
const report = await adapterContractHarness(cases, {
  projectRoot: process.cwd(),
  write: async (packet) => adapter.write(packet.backend_request)
});
```

The harness never calls `write` for blocked packets.

## Next Work

- Expand adapter-contract examples for common local-only memory flows.
- Add adapter error and retry compatibility cases.
- Add backend error mapping without provider-specific code.
- Keep all backend credential and hosted surfaces outside the core package until reviewed.
