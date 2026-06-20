# Pilot 002: Adapter Harness Block

Type: internal dogfood report.

This workflow tested whether the adapter contract harness can prove that blocked memory never becomes a backend write request.

## Command

```bash
node bin/chainseal.mjs adapter-harness /private/tmp/chainseal-pilots/adapter-cases.json \
  --project /private/tmp/chainseal-pilots/source
```

## Evidence

Result:

```text
ok: true
contract.version: chainseal.adapter.v1
allowed case actual: allow
blocked case actual: block
blocked packet receipt: null
blocked packet backend_request: null
blocked reason: content matches secret-like pattern
```

What Chainseal blocked:

```text
SERVICE_API_KEY = BLOCKED_TEST_VALUE_NOT_A_SECRET
```

This is a fake test value, not a real secret.

## Why It Matters

Adapter authors need one boring invariant:

```text
Do not call the backend unless Chainseal returns backend_request.
```

The harness makes that invariant testable before any real backend adapter exists.

## Limitations

- This proves the contract shape, not a provider-specific adapter.
- The blocked example is synthetic.
- Real adapters still need credential-boundary and provider-log review before they ship.
