#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
PKG_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

"$PKG_DIR/skills/clude-codex-memory/scripts/codex-memory-control-plane-canary.sh" "$ROOT"
