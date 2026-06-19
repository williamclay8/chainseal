#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
SCRIPT="$0"

while [ -L "$SCRIPT" ]; do
  DIR="$(CDPATH= cd -- "$(dirname -- "$SCRIPT")" && pwd)"
  LINK="$(readlink "$SCRIPT")"
  case "$LINK" in
    /*) SCRIPT="$LINK" ;;
    *) SCRIPT="$DIR/$LINK" ;;
  esac
done

PKG_DIR="$(CDPATH= cd -- "$(dirname -- "$SCRIPT")/.." && pwd)"

"$PKG_DIR/skills/chainseal/scripts/chainseal-canary.sh" "$ROOT"
