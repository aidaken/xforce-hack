import { completeJson } from "../llm/openrouter.js";
import { CLAIMS_SCHEMA, PLAN_SCHEMA, RENDER_SCHEMA, VERDICT_SCHEMA } from "./schemas.js";
import {
  CHECK_SYSTEM, checkUser,
  EXTRACT_SYSTEM, extractUser,
  RENDER_SYSTEM, renderUser,
  ROUTE_SYSTEM, routeUser,
} from "./prompts.js";
import {
  coverageReport, keepVerbatimClaims, locatorLine,
  normalize, reconcileCoverage, sentencesOf,
} from "./normalize.js";

const LEARNERS = new Set(["adhd", "dyslexia"]);
const FORMATS = new Set(["diagram", "checklist", "summary", "quiz"]);
const CHECK_CONCURRENCY = 5;

/** Bounded fan-out. A burst of 20 checker calls earns 429s mid-demo. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const n = i++;
        out[n] = await fn(items[n], n);
      }
    }),
  );
  return out;
}

function bad(code, message, status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  throw err;
}

/* ---------------------------------------------------------------- CALL 1 */

export async function extractClaims(document) {
  const text = document?.text ?? "";
  if (!text.trim()) bad("EMPTY_SOURCE", "That document has no text to work from.");

  const sentences = sentencesOf(text);
  const { data, usage } = await completeJson({
    messages: [
      { role: "system", content: EXTRACT_SYSTEM },
      {
        role: "user",
        content: extractUser({
          text,
          sentenceCount: sentences.length,
          // The ladder: report only what the input actually carries.
          locatorHint: { level: document.locatorLevel || "position" },
        }),
      },
    ],
    schema: CLAIMS_SCHEMA,
    schemaName: "claims",
  });

  // Guarantee, not a request: a span that is not verbatim is not a claim.
  const { kept, rejected } = keepVerbatimClaims(data.claims ?? [], text);
  const { uncovered, doubleCounted } = reconcileCoverage(kept, data.uncovered_sentences);

  if (kept.length === 0) {
    bad("VERIFY_NO_CLAIMS", "No claim survived the verbatim-span check.", 502);
  }

  return {
    claims: kept,
    passageStructure: data.passage_structure,
    sentenceCount: sentences.length,
    uncovered,
    audit: {
      rejectedSpans: rejected,
      doubleCounted: doubleCounted.map((u) => u.text),
      reportedSentenceCount: data.source_meta?.sentence_count ?? null,
    },
    usage,
  };
}

/* ---------------------------------------------------------------- CALL 2 */

async function route({ learner, formatPrefs, passageStructure, conceptType, claims }) {
  const { data } = await completeJson({
    messages: [
      { role: "system", content: ROUTE_SYSTEM },
      { role: "user", content: routeUser({ learner, formatPrefs, passageStructure, conceptType, claims }) },
    ],
    schema: PLAN_SCHEMA,
    schemaName: "plan",
  });
  return data;
}

/* ---------------------------------------------------------------- CALL 3 */

async function render({ learner, plan, claims }) {
  const { data } = await completeJson({
    messages: [
      { role: "system", content: RENDER_SYSTEM },
      { role: "user", content: renderUser({ learner, plan, claims }) },
    ],
    schema: RENDER_SCHEMA,
    schemaName: "rendering",
    temperature: 0.3,
  });
  return data;
}

/* ---------------------------------------------------------------- CALL 4 */

/** Flatten a rendering into the units a checker can judge one at a time. */
function checkableUnits(blocks) {
  const out = [];
  for (const b of blocks ?? []) {
    for (const u of b.units ?? []) {
      // Analogies are deliberately not-in-source. Checking them would flag the
      // feature as a hallucination and auto-repair would delete it.
      if (u.not_in_source) continue;
      const text = [u.title, u.body, u.yield ? `${u.yield.value} (${u.yield.qualifier ?? ""})` : ""]
        .filter(Boolean).join(". ");
      out.push({ id: u.id, kind: b.type, text, claims: [...(u.claims ?? []), ...(u.yield?.claims ?? [])] });
    }
    for (const n of b.nodes ?? []) out.push({ id: n.id, kind: `${b.type}:node`, text: n.label, claims: n.claims ?? [] });
    for (const e of b.edges ?? []) out.push({ id: `${e.from}->${e.to}`, kind: `${b.type}:edge`, text: e.label, claims: e.claims ?? [] });
    for (const [i, r] of (b.rows ?? []).entries()) out.push({ id: `row${i}`, kind: `${b.type}:row`, text: (r.cells ?? []).join(" | "), claims: r.claims ?? [] });
  }
  return out.filter((u) => u.text && u.claims.length);
}

async function checkUnit(unit, claimById) {
  const span = claimById.get(unit.claims[0])?.span;
  if (!span) return { ...unit, verdict: "EMBELLISHED", reason: "Cites no known claim.", offending_text: unit.text };
  const { data } = await completeJson({
    messages: [
      { role: "system", content: CHECK_SYSTEM },
      { role: "user", content: checkUser({ span, statement: unit.text }) },
    ],
    schema: VERDICT_SCHEMA,
    schemaName: "verdict",
  });
  return { ...unit, span, ...data };
}

/* -------------------------------------------------------------- PIPELINE */

/**
 * One extraction, N renderings. Both learner modes share a single claim list,
 * so the human side-by-side check runs against the source ONCE, and the two
 * renderings are provably about the same content.
 */
export async function remake({ document, learners, formatPrefs, extracted }) {
  const modes = (learners ?? ["adhd", "dyslexia"]).filter((l) => LEARNERS.has(l));
  if (modes.length === 0) bad("BAD_LEARNER", 'learners must include "adhd" or "dyslexia".');

  const prefs = (formatPrefs ?? []).filter((p) => FORMATS.has(p));
  const started = Date.now();

  const base = extracted ?? (await extractClaims(document));
  const claimById = new Map(base.claims.map((c) => [c.id, c]));

  const renderings = {};
  for (const learner of modes) {
    const plan = await route({
      learner,
      formatPrefs: prefs,
      passageStructure: base.passageStructure,
      conceptType: document?.conceptType,
      claims: base.claims,
    });
    const rendered = await render({ learner, plan, claims: base.claims });
    const units = checkableUnits(rendered.blocks);
    const checked = await mapLimit(units, CHECK_CONCURRENCY, (u) => checkUnit(u, claimById));

    const coverage = coverageReport(base.claims, rendered.blocks, rendered.dropped);
    const flagged = checked.filter((c) => c.verdict !== "SUPPORTED");

    renderings[learner] = {
      rationale: plan.rationale,
      refusals: plan.refusals,
      blocks: rendered.blocks,
      dropped: rendered.dropped,
      problems: rendered.problems,
      locatorLine: locatorLine(base.claims),
      audit: {
        coverage,
        checked: checked.length,
        supported: checked.length - flagged.length,
        flagged,
      },
    };
  }

  // Both modes must carry the same claims, or "same passage, two ways" is false.
  const idSets = modes.map((m) => new Set(
    (renderings[m].audit.coverage.silentlyMissing ?? []).map((c) => c.id),
  ));
  const sameCoverage = idSets.every((s) => s.size === idSets[0].size);

  return {
    ok: true,
    elapsedMs: Date.now() - started,
    source: {
      title: document?.title ?? null,
      conceptType: document?.conceptType ?? null,
      sentenceCount: base.sentenceCount,
      locatorLine: locatorLine(base.claims),
    },
    claims: base.claims,
    uncovered: base.uncovered,
    extractionAudit: base.audit,
    formatPrefs: prefs,
    renderings,
    sameCoverage,
  };
}

export { normalize };
