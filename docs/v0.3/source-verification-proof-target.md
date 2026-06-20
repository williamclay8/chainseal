# v0.3 Source Verification Proof Target

Goal:

```text
Show that Chainseal can reject stale or unsupported memory claims without making normal source-backed memory writes painful.
```

## Added In This Tranche

- Line-range validation for file source refs.
- `line`, `start_line`, and `end_line` schema fields.
- Hash mismatch diagnostics with expected and actual SHA-256 values.
- Missing-file diagnostics with possible moved-file matches.
- Fixture corpus for safe, poisoned, stale, and secret-like memory candidates.
- Expanded canaries for bad line ranges, hash mismatches, and moved-file diagnostics.

## Proof Commands

```bash
npm test
npm run pack:dry
git diff --check
```

Current dry-run package summary:

```text
package size: 35.9 kB
unpacked size: 126.2 kB
total files: 40
```

## Canary Additions

Expected canary additions:

```text
PASS: source line range outside file is blocked
PASS: source hash mismatch is blocked
PASS: missing source gives moved-file diagnostic
PASS: moved-file diagnostic includes possible matches
```

## Why This Matters

v0.2 proved the local trust loop exists.

v0.3 makes source-backed memory harder to fake:

- a file must exist;
- a line range must be valid;
- a hash can pin the exact file contents;
- a moved path can produce an actionable hint instead of a dead-end block.
