#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  auditReceipts,
  decide,
  readCandidate,
  recallPacket,
  storeCandidate,
} from "../lib/chainseal.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , command, ...args] = process.argv;

function usage() {
  console.log(`Usage:
  chainseal gate <candidate.json> [--project <repo-root>]
  chainseal store <candidate.json> --ledger <receipts.jsonl> [--project <repo-root>]
  chainseal recall <query> --ledger <receipts.jsonl> [--project <repo-root>]
  chainseal audit --ledger <receipts.jsonl> [--project <repo-root>]
  chainseal schema candidate|receipt
  chainseal canary [repo-root]

Aliases:
  chainseal-gate <candidate.json>
  chainseal-canary [repo-root]`);
}

function parseOptions(rawArgs) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--ledger" || arg === "--project") {
      options[arg.slice(2)] = rawArgs[index + 1];
      index += 1;
      continue;
    }
    positionals.push(arg);
  }
  return { positionals, options };
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function requireLedger(options) {
  if (!options.ledger) {
    throw new Error("--ledger <receipts.jsonl> is required");
  }
}

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    process.exit(0);
  }

  const { positionals, options } = parseOptions(args);
  const projectRoot = options.project ? path.resolve(options.project) : process.cwd();

  if (command === "gate") {
    const candidate = readCandidate(positionals[0]);
    const result = decide(candidate, { projectRoot });
    printJson(result);
    process.exit(result.ok ? 0 : result.decision === "needs_review" ? 2 : 1);
  }

  if (command === "store") {
    requireLedger(options);
    const candidate = readCandidate(positionals[0]);
    const result = storeCandidate(candidate, {
      ledger: options.ledger,
      projectRoot,
    });
    printJson(result);
    process.exit(result.ok ? 0 : 1);
  }

  if (command === "recall") {
    requireLedger(options);
    const query = positionals.join(" ");
    printJson(recallPacket({
      query,
      ledger: options.ledger,
      projectRoot,
    }));
    process.exit(0);
  }

  if (command === "audit") {
    requireLedger(options);
    const result = auditReceipts({
      ledger: options.ledger,
      projectRoot,
    });
    printJson(result);
    process.exit(result.ok ? 0 : 1);
  }

  if (command === "schema") {
    const name = positionals[0];
    if (!["candidate", "receipt"].includes(name)) {
      throw new Error("schema requires candidate or receipt");
    }
    process.stdout.write(fs.readFileSync(
      path.join(root, "schemas", `${name}.schema.json`),
      "utf8",
    ));
    process.exit(0);
  }

  if (command === "canary") {
    const script = path.join(root, "skills/chainseal/scripts/chainseal-canary.sh");
    const result = spawnSync(script, positionals.length ? positionals : [process.cwd()], {
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }

  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(64);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(64);
}
