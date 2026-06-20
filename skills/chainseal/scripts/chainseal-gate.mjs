#!/usr/bin/env node
import { decide, readCandidate, usage } from "../../../lib/chainseal.js";

try {
  const candidate = readCandidate(process.argv[2]);
  const result = decide(candidate, { projectRoot: process.cwd() });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : result.decision === "needs_review" ? 2 : 1);
} catch (error) {
  process.stderr.write(`${error.message || usage()}\n`);
  process.exit(64);
}
