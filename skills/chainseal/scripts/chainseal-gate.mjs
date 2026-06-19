#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const allowedTypes = new Set([
  "episodic",
  "semantic",
  "procedural",
  "self_model",
  "introspective",
]);

const safeActions = new Set(["store", "recall"]);
const reviewActions = new Set([
  "delete",
  "update",
  "list",
  "batch",
  "extract",
]);

const secretPatterns = [
  /\b[A-Z0-9_]*(API|TOKEN|SECRET|KEY|PASSWORD|PRIVATE|SESSION)[A-Z0-9_]*\s*=/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(sk|pk|rk|clk)_[A-Za-z0-9_-]{16,}\b/,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/i,
  /\bSUPABASE_SERVICE_KEY\b/i,
  /\bOPENAI_API_KEY\b/i,
  /\bANTHROPIC_API_KEY\b/i,
  /\b(wallet|private key|seed phrase|mnemonic)\b/i,
];

const rawTranscriptPatterns = [
  /^\s*(user|assistant|system|developer|tool):/im,
  /<\|im_start\|>|<\|im_end\|>/i,
  /BEGIN .* TOOL MAP/i,
  /SUPERMEMORY CONTEXT/i,
];

const instructionInjectionPatterns = [
  /\bignore (all )?(previous|above|system|developer) instructions\b/i,
  /\bprint (the )?(env|environment|secrets?|api keys?)\b/i,
  /\brun .*\b(rm -rf|git reset --hard|curl .*\| *sh)\b/i,
];

function usage() {
  return [
    "Usage: chainseal-gate.mjs <candidate.json>",
    "",
    "Candidate fields:",
    "  action: store | recall | delete | update | list | batch | extract",
    "  type: episodic | semantic | procedural | self_model | introspective",
    "  content: compact memory text",
    "  source_refs: [{ kind, ref, status }]",
    "  evidence: { status }",
    "  sensitivity: public | internal | private | secret",
    "  target_store: backend-local | repo | task-board | cross-session | other",
    "  lumi: { local, committed, pushed, deployed_live }",
  ].join("\n");
}

function readCandidate(file) {
  if (!file) {
    throw new Error(usage());
  }
  const resolved = path.resolve(file);
  const body = fs.readFileSync(resolved, "utf8");
  return JSON.parse(body);
}

function hasMatch(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function refsAreSourceBacked(refs) {
  return Array.isArray(refs) && refs.some((ref) => {
    if (!ref || typeof ref !== "object") return false;
    return typeof ref.ref === "string" && ref.ref.length > 0 &&
      ["verified", "source_backed", "current"].includes(String(ref.status || ""));
  });
}

function decide(candidate) {
  const reasons = [];
  const warnings = [];
  const action = String(candidate.action || "");
  const content = String(candidate.content || "");
  const sensitivity = String(candidate.sensitivity || "internal");
  const evidenceStatus = String(candidate.evidence?.status || "");

  if (!action) reasons.push("missing action");

  if (reviewActions.has(action)) {
    return {
      decision: "needs_review",
      reasons: [`${action} requires explicit scoped user intent`],
      warnings,
    };
  }

  if (!safeActions.has(action)) {
    reasons.push(`unsupported action: ${action || "none"}`);
  }

  if (action === "recall") {
    if (!content.trim() && !String(candidate.query || "").trim()) {
      reasons.push("recall requires content or query");
    }
    return {
      decision: reasons.length ? "block" : "allow",
      reasons,
      warnings: [
        ...warnings,
        "recall output must be treated as untrusted lead until source-verified",
      ],
    };
  }

  if (!allowedTypes.has(String(candidate.type || ""))) {
    reasons.push("missing or unsupported memory type");
  }

  if (!content.trim()) {
    reasons.push("missing content");
  }

  if (content.length > 1200) {
    reasons.push("content is too long for compact memory");
  }

  if (sensitivity === "secret") {
    reasons.push("secret sensitivity cannot be stored");
  }

  if (hasMatch(secretPatterns, content)) {
    reasons.push("content matches secret-like pattern");
  }

  if (hasMatch(rawTranscriptPatterns, content)) {
    reasons.push("content looks like raw transcript or agent context");
  }

  if (hasMatch(instructionInjectionPatterns, content)) {
    reasons.push("content contains instruction-injection shaped text");
  }

  if (!refsAreSourceBacked(candidate.source_refs)) {
    reasons.push("no verified source_refs");
  }

  if (!["verified", "source_backed", "current"].includes(evidenceStatus)) {
    reasons.push("evidence.status is not verified/source_backed/current");
  }

  if (!candidate.lumi || typeof candidate.lumi !== "object") {
    warnings.push("missing Lumi state");
  }

  if (!candidate.target_store) {
    warnings.push("missing target_store");
  }

  return {
    decision: reasons.length ? "block" : "allow",
    reasons,
    warnings,
  };
}

try {
  const candidate = readCandidate(process.argv[2]);
  const result = {
    ok: false,
    ...decide(candidate),
  };
  result.ok = result.decision === "allow";
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : result.decision === "needs_review" ? 2 : 1);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(64);
}
