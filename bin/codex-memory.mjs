#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , command, ...args] = process.argv;

function usage() {
  console.log(`Usage:
  codex-memory gate <candidate.json>
  codex-memory canary [repo-root]

Aliases:
  codex-memory-control-plane gate <candidate.json>
  codex-memory-gate <candidate.json>
  codex-memory-canary [repo-root]`);
}

if (!command || command === "help" || command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

if (command === "gate") {
  process.argv = [
    process.argv[0],
    path.join(root, "skills/clude-codex-memory/scripts/codex-memory-gate.mjs"),
    ...args,
  ];
  await import("../skills/clude-codex-memory/scripts/codex-memory-gate.mjs");
} else if (command === "canary") {
  const script = path.join(root, "skills/clude-codex-memory/scripts/codex-memory-control-plane-canary.sh");
  const result = spawnSync(script, args.length ? args : [process.cwd()], {
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(64);
}
