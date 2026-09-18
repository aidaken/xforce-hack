const PROCESS_HINTS =
  /\b(step|stage|then|next|first|second|finally|pathway|cycle|process|after|before|glycolysis|chain)\b/i;
const RULE_HINTS =
  /\b(if |unless |must |should |when you |only if |exception |do not |don't |strict mode|dependency)\b/i;
const DEFINITION_HINTS =
  /\b(is defined|means that|refers to|is the process|tells you how|in other words|composed of)\b/i;

/**
 * Cheap first-pass type tag so the planner has something before the LLM key lands.
 * OpenRouter can override this later.
 */
export function classifyPassage(text) {
  const process = count(text, PROCESS_HINTS);
  const rules = count(text, RULE_HINTS);
  const definitions = count(text, DEFINITION_HINTS);

  let conceptType = "process";
  let score = process;
  if (rules > score) {
    conceptType = "rule_system";
    score = rules;
  }
  if (definitions > score) {
    conceptType = "definition_cluster";
    score = definitions;
  }

  const rationale = {
    process: "This reads as a sequence of stages, so a checklist or flowchart fits.",
    rule_system:
      "This is full of conditions and exceptions, so if/then cards fit better than a story.",
    definition_cluster:
      "This is mostly terms and relations, so labeled nodes beat a long paraphrase.",
  }[conceptType];

  return {
    conceptType,
    scores: { process, rules, definitions },
    rationale,
  };
}

function count(text, re) {
  return (text.match(new RegExp(re.source, "gi")) || []).length;
}

export function chunkPassage(text, size = 700) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= size) return [clean];
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + size, clean.length);
    if (end < clean.length) {
      const period = clean.lastIndexOf(". ", end);
      if (period > i + 200) end = period + 1;
    }
    chunks.push(clean.slice(i, end).trim());
    i = end;
  }
  return chunks.filter(Boolean);
}

export function titleFromText(text, fallback = "Untitled passage") {
  const first = text.split(/[.?\n]/)[0]?.trim() || "";
  if (first.length < 12) return fallback;
  return first.length > 72 ? `${first.slice(0, 69)}…` : first;
}
