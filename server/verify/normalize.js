/**
 * Deterministic guardrails for the verifier.
 *
 * These are CODE, not prompt instructions, on purpose. A model asked to "only
 * quote verbatim" will paraphrase sometimes; a substring assert never does.
 * Everything here runs on both sides of a comparison and never on display text.
 */

/**
 * Both sides of every substring check run through this. If it is wrong, both
 * sides break identically and the check passes while production fails — so it
 * has its own test (see scripts/verify-smoke.mjs).
 *
 * Hazards seen in real OpenStax / MDN source: CO₂ subscripts, curly quotes,
 * soft hyphens from PDF extraction, → arrows, en-dash numeric ranges.
 */
export function normalize(s) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/­/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[→⇒]/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split into sentences. Used for the coverage denominator, not for display. */
export function sentencesOf(text) {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Drop any claim whose span is not a character-exact substring of the source.
 * This is the guarantee. Do NOT relax it to fuzzy matching when it fires —
 * fuzzy matching is the hole the guarantee exists to close. Fix normalize().
 */
export function keepVerbatimClaims(claims, sourceText) {
  const hay = normalize(sourceText);
  const kept = [];
  const rejected = [];
  for (const c of claims) {
    if (c?.span && hay.includes(normalize(c.span))) kept.push(c);
    else rejected.push({ id: c?.id ?? null, span: c?.span ?? null });
  }
  return { kept, rejected };
}

/**
 * A sentence that produced a claim is covered; it must not ALSO be excused.
 * The model gets this wrong even when the prompt says not to, so reconcile
 * here rather than adding another prompt rule.
 */
export function reconcileCoverage(claims, uncovered) {
  const spans = claims.map((c) => normalize(c.span));
  const doubleCounted = [];
  const genuine = [];
  for (const u of uncovered ?? []) {
    const n = normalize(u.text);
    if (n && spans.some((sp) => sp.includes(n))) doubleCounted.push(u);
    else genuine.push(u);
  }
  return { uncovered: genuine, doubleCounted };
}

/** Collect every claim id a rendering cites, across all block shapes. */
export function citedIds(blocks) {
  const ids = new Set();
  const eat = (arr) => (arr ?? []).forEach((id) => ids.add(id));
  for (const b of blocks ?? []) {
    (b.units ?? []).forEach((u) => {
      eat(u.claims);
      eat(u.yield?.claims);
    });
    (b.nodes ?? []).forEach((n) => eat(n.claims));
    (b.edges ?? []).forEach((e) => eat(e.claims));
    (b.rows ?? []).forEach((r) => eat(r.claims));
  }
  return ids;
}

/**
 * "Nothing lost" is the half most teams skip. Every extracted claim must be
 * used by the rendering or explicitly dropped with a reason.
 */
export function coverageReport(claims, blocks, declaredDrops = []) {
  const cited = citedIds(blocks);
  const dropped = new Set(declaredDrops.map((d) => d.id));
  const missing = claims.filter((c) => !cited.has(c.id) && !dropped.has(c.id));
  return {
    total: claims.length,
    used: claims.filter((c) => cited.has(c.id)).length,
    declaredDropped: declaredDrops,
    silentlyMissing: missing.map((c) => ({ id: c.id, text: c.text })),
    ok: missing.length === 0,
  };
}

/**
 * The locator line is the first thing a judge reads. Both endpoints of a
 * printed range must actually exist in the claims — never widened to the
 * chapter because the chapter goes that far.
 */
export function locatorLine(claims) {
  const values = [...new Set(claims.map((c) => c.locator?.value).filter(Boolean))];
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];
  const sorted = values.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}
