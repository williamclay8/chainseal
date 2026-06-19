#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
fail=0

say() { printf '%s\n' "$*"; }
pass() { say "PASS: $*"; }
warn() { say "WARN: $*"; }
bad() { say "FAIL: $*"; fail=1; }

say "# Clude Codex Canary"
say "root=$ROOT"

if ! command -v codex >/dev/null 2>&1; then
  bad "codex CLI is not available"
else
  MCP_LIST="$(codex mcp list 2>/dev/null || true)"
  if printf '%s\n' "$MCP_LIST" | grep -q 'clude-local'; then
    pass "codex MCP entry clude-local exists"
  else
    bad "codex MCP entry clude-local is missing"
  fi

  if printf '%s\n' "$MCP_LIST" | grep -q '@clude/sdk@3.2.0'; then
    pass "Clude SDK package is pinned to @clude/sdk@3.2.0"
  else
    bad "Clude SDK package is not visibly pinned to @clude/sdk@3.2.0"
  fi

  if printf '%s\n' "$MCP_LIST" | grep -q 'mcp-serve.*--local'; then
    pass "Clude MCP uses mcp-serve --local"
  else
    bad "Clude MCP does not visibly use mcp-serve --local"
  fi

  if printf '%s\n' "$MCP_LIST" | grep -A2 -B2 'clude-local' | grep -q 'CORTEX_API_KEY'; then
    bad "clude-local appears to include hosted CORTEX_API_KEY env"
  else
    pass "clude-local does not expose hosted CORTEX_API_KEY in redacted MCP list"
  fi
fi

if [ -f "$ROOT/.env" ]; then
  bad "repo .env exists; the Clude Codex pilot should not create or require it"
else
  pass "repo .env absent"
fi

if [ -f "$ROOT/.mcp.json" ]; then
  warn "repo .mcp.json exists; verify it was intentional and does not contain hosted Clude secrets"
else
  pass "repo .mcp.json absent"
fi

if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  say
  say "# Git"
  git -C "$ROOT" status --short --branch
fi

exit "$fail"
