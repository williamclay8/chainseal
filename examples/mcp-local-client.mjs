#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "chainseal-mcp-example-"));
fs.mkdirSync(path.join(sourceRoot, "docs"), { recursive: true });
fs.writeFileSync(
  path.join(sourceRoot, "docs/chainseal-architecture.md"),
  "# Example Source\n\nChainseal examples use local source refs.\n",
);

const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "chainseal_propose_store",
  params: {
    projectRoot: sourceRoot,
    candidate: {
      action: "store",
      type: "semantic",
      content: "SERVICE_API_KEY = BLOCKED_TEST_VALUE_NOT_A_SECRET",
      source_refs: [
        { kind: "file", ref: "docs/chainseal-architecture.md", status: "verified" },
      ],
      evidence: { status: "verified" },
      sensitivity: "internal",
      target_store: "backend-local",
      lumi: { local: "clean" },
    },
  },
};

const result = spawnSync(process.execPath, [
  path.join(repoRoot, "bin/chainseal-mcp.mjs"),
], {
  input: `${JSON.stringify(request)}\n`,
  encoding: "utf8",
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status || 1);
}

const response = JSON.parse(result.stdout.trim());
const packet = response.result;
process.stdout.write(`${JSON.stringify({
  method: request.method,
  ok: packet.ok,
  backend_request: packet.backend_request,
  reasons: packet.gate.reasons,
}, null, 2)}\n`);
