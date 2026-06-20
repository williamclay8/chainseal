import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const allowedTypes = new Set([
  "episodic",
  "semantic",
  "procedural",
  "self_model",
  "introspective",
]);

export const safeActions = new Set(["store", "recall"]);
export const reviewActions = new Set([
  "delete",
  "update",
  "list",
  "batch",
  "extract",
]);

export const verifiedStatuses = new Set(["verified", "source_backed", "current"]);

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
  /\breveal (the )?(prompt|system prompt|developer instructions)\b/i,
  /\b(system override|developer mode|jailbreak)\b/i,
  /\brun .*\b(rm -rf|git reset --hard|curl .*\| *sh)\b/i,
];

const fuzzyInjectionWords = [
  "ignore",
  "bypass",
  "override",
  "reveal",
  "delete",
  "system",
  "secret",
];

export function usage() {
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

export function readCandidate(file) {
  if (!file) {
    throw new Error(usage());
  }
  const resolved = path.resolve(file);
  const body = fs.readFileSync(resolved, "utf8");
  return JSON.parse(body);
}

export function hasSecretLikeContent(text) {
  return hasMatch(secretPatterns, String(text || ""));
}

function hasMatch(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function sortedMiddle(word) {
  return word.slice(1, -1).split("").sort().join("");
}

function isTypoglycemiaVariant(word, target) {
  return word.length === target.length &&
    word.length > 3 &&
    word[0] === target[0] &&
    word.at(-1) === target.at(-1) &&
    sortedMiddle(word) === sortedMiddle(target) &&
    word !== target;
}

function hasObfuscatedInstructionWord(text) {
  const words = String(text || "").toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  return words.some((word) => (
    fuzzyInjectionWords.some((target) => isTypoglycemiaVariant(word, target))
  ));
}

function resolveProjectFile(projectRoot, ref) {
  const root = path.resolve(projectRoot || process.cwd());
  const target = path.resolve(root, ref);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return {
      ok: false,
      reason: `source_ref escapes project root: ${ref}`,
      root,
      target,
    };
  }
  if (!fs.existsSync(target)) {
    return {
      ok: false,
      reason: `source_ref file does not exist: ${ref}`,
      root,
      target,
    };
  }
  return { ok: true, root, target };
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function inspectSourceRefs(refs, options = {}) {
  const reasons = [];
  const warnings = [];
  const verified = [];
  const projectRoot = options.projectRoot || process.cwd();

  if (!Array.isArray(refs) || refs.length === 0) {
    return { ok: false, reasons: ["no source_refs"], warnings, verified };
  }

  for (const sourceRef of refs) {
    if (!sourceRef || typeof sourceRef !== "object") {
      reasons.push("source_ref must be an object");
      continue;
    }

    const ref = String(sourceRef.ref || "");
    const status = String(sourceRef.status || "");
    const kind = String(sourceRef.kind || "file");

    if (!ref) {
      reasons.push("source_ref missing ref");
      continue;
    }

    if (!verifiedStatuses.has(status)) {
      reasons.push(`source_ref is not verified/current/source_backed: ${ref}`);
      continue;
    }

    if (kind === "file") {
      const resolved = resolveProjectFile(projectRoot, ref);
      if (!resolved.ok) {
        reasons.push(resolved.reason);
        continue;
      }
      if (sourceRef.sha256 && sourceRef.sha256 !== sha256(resolved.target)) {
        reasons.push(`source_ref sha256 mismatch: ${ref}`);
        continue;
      }
      verified.push({
        ...sourceRef,
        resolved_ref: path.relative(resolved.root, resolved.target),
      });
      continue;
    }

    if (/^https?:\/\//i.test(ref)) {
      warnings.push(`non-file source_ref cannot be locally rechecked: ${ref}`);
      verified.push(sourceRef);
      continue;
    }

    warnings.push(`unknown source_ref kind cannot be locally rechecked: ${kind}`);
    verified.push(sourceRef);
  }

  if (verified.length === 0 && reasons.length === 0) {
    reasons.push("no verified source_refs");
  }

  return {
    ok: verified.length > 0 && reasons.length === 0,
    reasons,
    warnings,
    verified,
  };
}

export function decide(candidate, options = {}) {
  const reasons = [];
  const warnings = [];
  const action = String(candidate?.action || "");
  const content = String(candidate?.content || "");
  const sensitivity = String(candidate?.sensitivity || "internal");
  const evidenceStatus = String(candidate?.evidence?.status || "");

  if (!action) reasons.push("missing action");

  if (reviewActions.has(action)) {
    return withOk({
      decision: "needs_review",
      reasons: [`${action} requires explicit scoped user intent`],
      warnings,
    });
  }

  if (!safeActions.has(action)) {
    reasons.push(`unsupported action: ${action || "none"}`);
  }

  if (action === "recall") {
    if (!content.trim() && !String(candidate?.query || "").trim()) {
      reasons.push("recall requires content or query");
    }
    return withOk({
      decision: reasons.length ? "block" : "allow",
      reasons,
      warnings: [
        ...warnings,
        "recall output must be treated as untrusted lead until source-verified",
      ],
    });
  }

  if (!allowedTypes.has(String(candidate?.type || ""))) {
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

  if (hasSecretLikeContent(content)) {
    reasons.push("content matches secret-like pattern");
  }

  if (hasMatch(rawTranscriptPatterns, content)) {
    reasons.push("content looks like raw transcript or agent context");
  }

  if (
    hasMatch(instructionInjectionPatterns, content) ||
    hasObfuscatedInstructionWord(content)
  ) {
    reasons.push("content contains instruction-injection shaped text");
  }

  const sourceCheck = inspectSourceRefs(candidate?.source_refs, options);
  if (!sourceCheck.ok) {
    reasons.push(...sourceCheck.reasons);
  }
  warnings.push(...sourceCheck.warnings);

  if (!verifiedStatuses.has(evidenceStatus)) {
    reasons.push("evidence.status is not verified/source_backed/current");
  }

  if (!candidate?.lumi || typeof candidate.lumi !== "object") {
    warnings.push("missing Lumi state");
  }

  if (!candidate?.target_store) {
    warnings.push("missing target_store");
  }

  return withOk({
    decision: reasons.length ? "block" : "allow",
    reasons,
    warnings,
    verified_source_refs: sourceCheck.verified,
  });
}

function withOk(result) {
  return {
    ok: result.decision === "allow",
    reasons: [],
    warnings: [],
    ...result,
  };
}

export function createReceipt(candidate, gate, options = {}) {
  const createdAt = options.createdAt || new Date().toISOString();
  const reviewDate = new Date(Date.parse(createdAt) + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    id: options.id || `chainseal-${createdAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    created_at: createdAt,
    type: candidate.type,
    scope: candidate.scope || "project",
    content: candidate.content,
    source_refs: candidate.source_refs || [],
    evidence: candidate.evidence || {},
    validity: {
      valid_from: createdAt.slice(0, 10),
      valid_until: null,
      invalidated_by: [],
    },
    sensitivity: candidate.sensitivity || "internal",
    trust_tier: gate.decision === "allow" ? "source_backed" : "blocked",
    stores: candidate.target_store ? [candidate.target_store] : [],
    expires_or_review_after: candidate.expires_or_review_after || reviewDate,
    gate: {
      decision: gate.decision,
      reasons: gate.reasons || [],
      warnings: gate.warnings || [],
    },
    lumi: candidate.lumi || null,
  };
}

export function appendReceipt(ledger, receipt) {
  if (!ledger) {
    throw new Error("store requires an explicit ledger path");
  }
  const resolved = path.resolve(ledger);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.appendFileSync(resolved, `${JSON.stringify(receipt)}\n`);
  return resolved;
}

export function loadReceipts(ledger) {
  if (!ledger) {
    throw new Error("ledger path is required");
  }
  const resolved = path.resolve(ledger);
  if (!fs.existsSync(resolved)) return [];
  return fs.readFileSync(resolved, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`invalid JSONL receipt at line ${index + 1}: ${error.message}`);
      }
    });
}

export function storeCandidate(candidate, options = {}) {
  if (!options.ledger) {
    throw new Error("store requires an explicit ledger path");
  }
  const gate = decide(candidate, options);
  if (!gate.ok) {
    return { ok: false, gate, ledger: path.resolve(options.ledger) };
  }
  const now = options.now instanceof Date ? options.now.toISOString() : undefined;
  const receipt = createReceipt(candidate, gate, { createdAt: now });
  const ledger = appendReceipt(options.ledger, receipt);
  return { ok: true, gate, receipt, ledger };
}

export function auditReceipts(options = {}) {
  const ledger = options.ledger;
  const receipts = loadReceipts(ledger);
  const issues = [];

  receipts.forEach((receipt, index) => {
    const receiptId = receipt.id || `line-${index + 1}`;
    if (hasSecretLikeContent(receipt.content)) {
      issues.push({
        receipt_id: receiptId,
        severity: "blocker",
        reason: "receipt content matches secret-like pattern",
      });
    }

    const sourceCheck = inspectSourceRefs(receipt.source_refs, options);
    for (const reason of sourceCheck.reasons) {
      issues.push({
        receipt_id: receiptId,
        severity: "error",
        reason,
      });
    }

    if (!receipt.lumi || typeof receipt.lumi !== "object") {
      issues.push({
        receipt_id: receiptId,
        severity: "warning",
        reason: "missing Lumi state",
      });
    }
  });

  return {
    ok: issues.length === 0,
    ledger: path.resolve(ledger),
    receipts_checked: receipts.length,
    issues,
  };
}

export function recallPacket(options = {}) {
  const query = String(options.query || "").trim();
  if (!query) {
    throw new Error("recall requires a query");
  }
  const receipts = loadReceipts(options.ledger);
  const needle = query.toLowerCase();
  const matches = receipts.filter((receipt) => {
    const content = String(receipt.content || "").toLowerCase();
    const refs = JSON.stringify(receipt.source_refs || []).toLowerCase();
    return content.includes(needle) || refs.includes(needle);
  }).map((receipt) => ({
    id: receipt.id,
    memory: receipt.content,
    source_refs: receipt.source_refs || [],
    trust_tier: receipt.trust_tier || "unknown",
    freshness: receipt.expires_or_review_after
      ? `review_after:${receipt.expires_or_review_after}`
      : "unknown",
    sensitivity: receipt.sensitivity || "internal",
    gate: receipt.gate || null,
  }));

  return {
    query,
    generated_at: new Date().toISOString(),
    source: options.ledger ? path.resolve(options.ledger) : null,
    trust_tier: matches.length ? "source_backed" : "none",
    sensitivity: matches.some((match) => match.sensitivity === "private")
      ? "private"
      : "internal",
    use_as: "lead",
    required_verification_before_action:
      "Verify recalled memories against their source_refs, repo files, tests, git, CI, provider state, or live URLs before acting.",
    matches,
  };
}
