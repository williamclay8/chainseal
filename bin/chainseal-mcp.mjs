#!/usr/bin/env node
import readline from "node:readline";

import {
  handleMcpRequest,
  mcpDescriptor,
} from "../lib/chainseal.js";

const [, , command] = process.argv;

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

if (command === "--descriptor" || command === "descriptor") {
  printJson(mcpDescriptor());
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    process.stdout.write(`${JSON.stringify(handleMcpRequest(request))}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: error.message },
    })}\n`);
  }
});

