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

export const adapterContractVersion = "chainseal.adapter.v1";
export const mcpFacadeVersion = "chainseal.mcp.local.v1";

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

function countLines(file) {
  const body = fs.readFileSync(file, "utf8");
  if (!body) return 0;
  return body.endsWith("\n")
    ? body.slice(0, -1).split(/\r?\n/).length
    : body.split(/\r?\n/).length;
}

function toPositiveInteger(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : NaN;
}

function inspectLineSpan(sourceRef, resolved) {
  const singleLine = toPositiveInteger(sourceRef.line);
  const rawStartLine = toPositiveInteger(sourceRef.start_line);
  const rawEndLine = toPositiveInteger(sourceRef.end_line);
  const startLine = singleLine ?? rawStartLine;
  const endLine = singleLine ?? rawEndLine ?? startLine;

  if (startLine === null && endLine === null) return { ok: true, lineSpan: null };

  if (startLine === null && rawEndLine !== null) {
    return {
      ok: false,
      reason: `source_ref line range requires line or start_line when end_line is set: ${sourceRef.ref}`,
    };
  }

  if (Number.isNaN(startLine) || Number.isNaN(endLine)) {
    return {
      ok: false,
      reason: `source_ref line range must use positive integers: ${sourceRef.ref}`,
    };
  }

  if (endLine < startLine) {
    return {
      ok: false,
      reason: `source_ref line range end precedes start: ${sourceRef.ref}:${startLine}-${endLine}`,
    };
  }

  const lineCount = countLines(resolved.target);
  if (startLine > lineCount || endLine > lineCount) {
    return {
      ok: false,
      reason: `source_ref line range outside file: ${sourceRef.ref}:${startLine}-${endLine} (file has ${lineCount} lines)`,
      lineSpan: { start_line: startLine, end_line: endLine, line_count: lineCount },
    };
  }

  return {
    ok: true,
    lineSpan: { start_line: startLine, end_line: endLine, line_count: lineCount },
  };
}

function possibleFileMatches(root, ref, limit = 5) {
  const wanted = path.basename(ref);
  if (!wanted) return [];

  const ignoredDirectories = new Set([
    ".git",
    "node_modules",
    "coverage",
    "dist",
    "build",
    ".next",
    ".cache",
  ]);
  const matches = [];

  function walk(directory) {
    if (matches.length >= limit) return;

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (matches.length >= limit) return;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) walk(target);
        continue;
      }

      if (entry.isFile() && entry.name === wanted) {
        const relative = path.relative(root, target);
        if (relative !== ref) matches.push(relative);
      }
    }
  }

  walk(root);
  return matches.sort();
}

export function inspectSourceRefs(refs, options = {}) {
  const reasons = [];
  const warnings = [];
  const diagnostics = [];
  const verified = [];
  const projectRoot = options.projectRoot || process.cwd();

  if (!Array.isArray(refs) || refs.length === 0) {
    return { ok: false, reasons: ["no source_refs"], warnings, diagnostics, verified };
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
      diagnostics.push({ kind: "missing_ref" });
      continue;
    }

    if (!verifiedStatuses.has(status)) {
      reasons.push(`source_ref is not verified/current/source_backed: ${ref}`);
      diagnostics.push({ kind: "unverified_status", ref, status });
      continue;
    }

    if (kind === "file") {
      const resolved = resolveProjectFile(projectRoot, ref);
      if (!resolved.ok) {
        const diagnostic = { kind: "missing_or_invalid_file", ref, reason: resolved.reason };
        if (resolved.reason.startsWith("source_ref file does not exist")) {
          const matches = possibleFileMatches(resolved.root, ref);
          if (matches.length) diagnostic.possible_matches = matches;
        }
        const hint = diagnostic.possible_matches?.length
          ? ` (possible matches: ${diagnostic.possible_matches.join(", ")})`
          : "";
        reasons.push(`${resolved.reason}${hint}`);
        diagnostics.push(diagnostic);
        continue;
      }

      if (sourceRef.sha256) {
        const actualSha256 = sha256(resolved.target);
        if (sourceRef.sha256 !== actualSha256) {
          reasons.push(`source_ref sha256 mismatch: ${ref}`);
          diagnostics.push({
            kind: "sha256_mismatch",
            ref,
            expected_sha256: sourceRef.sha256,
            actual_sha256: actualSha256,
          });
          continue;
        }
      }

      const lineCheck = inspectLineSpan(sourceRef, resolved);
      if (!lineCheck.ok) {
        reasons.push(lineCheck.reason);
        diagnostics.push({
          kind: "line_range_invalid",
          ref,
          line_span: lineCheck.lineSpan || null,
        });
        continue;
      }
      verified.push({
        ...sourceRef,
        resolved_ref: path.relative(resolved.root, resolved.target),
        ...(lineCheck.lineSpan ? { line_span: lineCheck.lineSpan } : {}),
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
    diagnostics,
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
    source_diagnostics: sourceCheck.diagnostics,
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
    fact_key: candidate.fact_key || null,
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

export function adapterContract() {
  return {
    version: adapterContractVersion,
    posture: "fail_closed",
    backend_neutral: true,
    operations: [
      {
        name: "memory.write",
        requires: ["candidate", "gate.decision", "receipt"],
        writes_when: "gate.decision == allow",
        failure_mode: "backend_request is null when Chainseal blocks or needs review",
      },
      {
        name: "memory.recall",
        returns: "recall packet",
        use_as: "lead",
        requires_verification_before_action: true,
      },
      {
        name: "memory.audit",
        returns: "ledger audit packet",
        failure_mode: "non-empty issues make ok false",
      },
    ],
  };
}

export function adapterWritePacket(candidate, options = {}) {
  const gate = decide(candidate, options);
  const allowed = gate.decision === "allow";
  const createdAt = options.createdAt ||
    (options.now instanceof Date ? options.now.toISOString() : undefined);
  const receipt = allowed ? createReceipt(candidate, gate, { createdAt }) : null;

  return {
    ok: allowed,
    contract: adapterContract(),
    operation: "memory.write",
    fail_closed: !allowed,
    gate,
    receipt,
    backend_request: allowed
      ? {
          action: "write",
          memory: candidate.content,
          source_refs: gate.verified_source_refs || candidate.source_refs || [],
          receipt,
        }
      : null,
  };
}

export async function adapterContractHarness(cases, options = {}) {
  const normalizedCases = Array.isArray(cases) ? cases : cases?.cases;
  if (!Array.isArray(normalizedCases) || normalizedCases.length === 0) {
    throw new Error("adapter harness requires at least one case");
  }

  const results = [];
  for (const [index, testCase] of normalizedCases.entries()) {
    const name = testCase?.name || `case-${index + 1}`;
    const expected = testCase?.expect || "allow";
    const packet = adapterWritePacket(testCase?.candidate, options);
    const actual = packet.gate.decision;
    const violations = [];
    let adapterResult = null;

    if (actual !== expected) {
      violations.push(`expected ${expected} but got ${actual}`);
    }

    if (packet.ok && !packet.backend_request) {
      violations.push("allowed packet is missing backend_request");
    }

    if (!packet.ok && packet.backend_request !== null) {
      violations.push("blocked packet includes backend_request");
    }

    if (!packet.ok && packet.receipt !== null) {
      violations.push("blocked packet includes receipt");
    }

    if (packet.ok && typeof options.write === "function") {
      adapterResult = await options.write(packet);
    }

    results.push({
      name,
      expected,
      actual,
      ok: violations.length === 0,
      violations,
      packet,
      adapter_result: adapterResult,
    });
  }

  return {
    ok: results.every((result) => result.ok),
    contract: adapterContract(),
    cases: results,
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
  const now = options.now instanceof Date ? options.now : new Date();
  const contradictions = findContradictions(receipts);

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

    const freshness = receiptFreshness(receipt, now);
    if (freshness === "review_due") {
      issues.push({
        receipt_id: receiptId,
        severity: "warning",
        reason: `review-after date has passed: ${receipt.expires_or_review_after}`,
      });
    }

    if (freshness === "stale") {
      issues.push({
        receipt_id: receiptId,
        severity: "warning",
        reason: "receipt validity has expired or been invalidated",
      });
    }
  });

  for (const contradiction of contradictions) {
    for (const receiptId of contradiction.receipt_ids) {
      issues.push({
        receipt_id: receiptId,
        severity: "warning",
        reason: `contradictory receipts share fact_key: ${contradiction.fact_key}`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    ledger: path.resolve(ledger),
    receipts_checked: receipts.length,
    contradictions,
    issues,
  };
}

function todayString(date) {
  return date.toISOString().slice(0, 10);
}

function receiptFreshness(receipt, now = new Date()) {
  const today = todayString(now);
  if (Array.isArray(receipt?.validity?.invalidated_by) && receipt.validity.invalidated_by.length) {
    return "stale";
  }
  if (receipt?.validity?.valid_until && receipt.validity.valid_until < today) {
    return "stale";
  }
  if (receipt?.expires_or_review_after && receipt.expires_or_review_after < today) {
    return "review_due";
  }
  return "current";
}

function findContradictions(receipts) {
  const byFactKey = new Map();
  for (const receipt of receipts) {
    const factKey = receipt?.fact_key;
    if (!factKey) continue;
    if (!byFactKey.has(factKey)) byFactKey.set(factKey, []);
    byFactKey.get(factKey).push(receipt);
  }

  const contradictions = [];
  for (const [factKey, grouped] of byFactKey) {
    const contentSet = new Set(grouped.map((receipt) => String(receipt.content || "")));
    if (contentSet.size > 1) {
      contradictions.push({
        fact_key: factKey,
        receipt_ids: grouped.map((receipt) => receipt.id).filter(Boolean),
        contents: [...contentSet],
      });
    }
  }
  return contradictions;
}

export function recallPacket(options = {}) {
  const query = String(options.query || "").trim();
  if (!query) {
    throw new Error("recall requires a query");
  }
  const receipts = loadReceipts(options.ledger);
  const now = options.now instanceof Date ? options.now : new Date();
  const contradictions = findContradictions(receipts);
  const needle = query.toLowerCase();
  const matches = receipts.filter((receipt) => {
    const content = String(receipt.content || "").toLowerCase();
    const refs = JSON.stringify(receipt.source_refs || []).toLowerCase();
    return content.includes(needle) || refs.includes(needle);
  }).map((receipt) => ({
    id: receipt.id,
    memory: receipt.content,
    fact_key: receipt.fact_key || null,
    source_refs: receipt.source_refs || [],
    trust_tier: receipt.trust_tier || "unknown",
    freshness: receiptFreshness(receipt, now),
    review_after: receipt.expires_or_review_after || null,
    requires_review: contradictions.some((item) => item.fact_key === receipt.fact_key) ||
      receiptFreshness(receipt, now) !== "current",
    sensitivity: receipt.sensitivity || "internal",
    gate: receipt.gate || null,
  })).sort((left, right) => {
    const rank = { current: 0, review_due: 1, stale: 2 };
    return (rank[left.freshness] ?? 3) - (rank[right.freshness] ?? 3);
  });

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
    contradictions,
    matches,
  };
}

export function mcpDescriptor() {
  return {
    version: mcpFacadeVersion,
    transport: "stdio-json-rpc",
    local_only: true,
    tools: [
      {
        name: "chainseal_propose_store",
        description: "Gate a memory candidate and return a fail-closed adapter write packet without writing to a backend.",
      },
      {
        name: "chainseal_recall_packet",
        description: "Return source-grounded recalled memories as leads that require verification before action.",
      },
      {
        name: "chainseal_audit",
        description: "Audit a local receipt ledger for stale, contradictory, missing-source, or unsafe receipts.",
      },
      {
        name: "chainseal_receipt",
        description: "Create a receipt preview for an allowed candidate without appending it to a ledger.",
      },
      {
        name: "chainseal_schema",
        description: "Return a packaged Chainseal schema name for local clients.",
      },
    ],
  };
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function jsonRpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export function handleMcpRequest(request, options = {}) {
  const id = request?.id ?? null;
  const params = request?.params || {};
  const projectRoot = params.projectRoot || options.projectRoot || process.cwd();

  try {
    if (!request || request.jsonrpc !== "2.0" || !request.method) {
      return jsonRpcError(id, -32600, "invalid JSON-RPC request");
    }

    if (request.method === "chainseal_propose_store") {
      return jsonRpcResult(id, adapterWritePacket(params.candidate, {
        ...options,
        projectRoot,
      }));
    }

    if (request.method === "chainseal_recall_packet") {
      return jsonRpcResult(id, recallPacket({
        query: params.query,
        ledger: params.ledger,
        projectRoot,
        now: options.now,
      }));
    }

    if (request.method === "chainseal_audit") {
      return jsonRpcResult(id, auditReceipts({
        ledger: params.ledger,
        projectRoot,
        now: options.now,
      }));
    }

    if (request.method === "chainseal_receipt") {
      const gate = decide(params.candidate, { projectRoot });
      return jsonRpcResult(id, {
        ok: gate.ok,
        gate,
        receipt: gate.ok ? createReceipt(params.candidate, gate) : null,
      });
    }

    if (request.method === "chainseal_schema") {
      return jsonRpcResult(id, {
        name: params.name,
        supported: ["candidate", "receipt", "adapter-contract"],
      });
    }

    return jsonRpcError(id, -32601, `unknown Chainseal method: ${request.method}`);
  } catch (error) {
    return jsonRpcError(id, -32000, error.message);
  }
}
