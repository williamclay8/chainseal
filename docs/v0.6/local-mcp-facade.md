# v0.6 Local MCP Facade

Status: local stdio JSON-RPC facade implemented.

Goal:

```text
Give agent runtimes a local Chainseal surface without turning Chainseal into a hosted memory service.
```

## Descriptor

CLI:

```bash
chainseal mcp-descriptor
```

Direct binary:

```bash
chainseal-mcp descriptor
```

Client example:

```bash
node examples/mcp-local-client.mjs
```

Runtime version:

```text
chainseal.mcp.local.v1
```

Transport:

```text
stdio-json-rpc
```

## Tools

The facade exposes:

- `chainseal_propose_store`: gate a candidate and return a fail-closed adapter write packet;
- `chainseal_recall_packet`: return recalled receipt matches as leads;
- `chainseal_audit`: audit a local receipt ledger;
- `chainseal_receipt`: create an allowed receipt preview without appending to a ledger;
- `chainseal_schema`: return supported schema names.

It does not expose broad delete, update, list, batch, or extraction tools.

## Fail-Closed Rule

Agent runtimes should treat `chainseal_propose_store` like this:

```text
Only write to a backend when result.ok is true and result.backend_request is present.
```

When Chainseal blocks:

```json
{
  "ok": false,
  "backend_request": null
}
```

## Current Proof

The test suite proves:

- the descriptor exposes the expected local tools;
- proposed unsafe memory returns `backend_request: null`;
- unknown methods fail with a JSON-RPC method-not-found error.

The canary proves:

```text
PASS: local MCP descriptor exposes propose-store
PASS: local MCP propose-store fails closed
```

The local client example prints:

```json
{
  "method": "chainseal_propose_store",
  "ok": false,
  "backend_request": null,
  "reasons": ["content matches secret-like pattern"]
}
```

## Known Limits

- This is a local facade, not a remote server.
- It does not manage credentials, global MCP config, or hosted backends.
- It uses newline-delimited JSON-RPC over stdin/stdout.
- Schema retrieval currently returns supported schema names rather than full schema bodies.

## Next Work

- Expand documented local client examples for recall and audit.
- Add descriptor drift checks to CI.
- Add per-tool input examples.
- Add governance docs before any global MCP config mutation.
