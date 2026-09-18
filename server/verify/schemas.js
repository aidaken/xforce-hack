/**
 * Strict JSON schemas for the verifier calls.
 *
 * `strict: true` + `additionalProperties: false` everywhere. This is a far
 * bigger reliability lever than prompt-level "return JSON only" pleading, and
 * only some OpenRouter providers support it — see the provider pinning in
 * server/llm/openrouter.js completeJson().
 */

const LOCATOR = {
  type: "object",
  additionalProperties: false,
  required: ["level", "value"],
  properties: {
    level: { type: "string", enum: ["page", "section", "heading", "position"] },
    value: { type: "string" },
  },
};

const SIGNAL = {
  type: "string",
  enum: ["sequential", "comparative", "quantitative", "cyclic", "conceptual"],
};

export const CLAIMS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["source_meta", "passage_structure", "claims", "uncovered_sentences"],
  properties: {
    source_meta: {
      type: "object",
      additionalProperties: false,
      required: ["title", "locator_level", "sentence_count"],
      properties: {
        title: { type: ["string", "null"] },
        locator_level: { type: "string", enum: ["page", "section", "heading", "position"] },
        sentence_count: { type: "integer" },
      },
    },
    passage_structure: SIGNAL,
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text", "span", "locator", "structure_signal", "quantity", "depends_on"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          span: { type: "string" },
          locator: LOCATOR,
          structure_signal: SIGNAL,
          quantity: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["value", "qualifier"],
            properties: {
              value: { type: "string" },
              qualifier: { type: ["string", "null"] },
            },
          },
          depends_on: { type: ["array", "null"], items: { type: "string" } },
        },
      },
    },
    uncovered_sentences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "text", "reason"],
        properties: {
          index: { type: "integer" },
          text: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};

export const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["blocks", "refusals", "unplaced", "rationale"],
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "claims", "why"],
        properties: {
          type: {
            type: "string",
            enum: ["flow", "cycle", "table", "bar", "checklist", "prose"],
          },
          claims: { type: "array", items: { type: "string" } },
          why: { type: "string" },
        },
      },
    },
    refusals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "reason"],
        properties: { type: { type: "string" }, reason: { type: "string" } },
      },
    },
    unplaced: { type: "array", items: { type: "string" } },
    rationale: { type: "string" },
  },
};

export const RENDER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["blocks", "dropped", "problems"],
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "units", "nodes", "edges", "rows"],
        properties: {
          type: { type: "string" },
          units: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "title", "body", "claims", "reward", "yield", "not_in_source"],
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                body: { type: "string" },
                claims: { type: "array", items: { type: "string" } },
                // A dimensionless game token. NOT a fact, carries no claim id.
                reward: { type: ["string", "null"] },
                // A source quantity. Carries claim ids AND the source qualifier.
                yield: {
                  type: ["object", "null"],
                  additionalProperties: false,
                  required: ["value", "qualifier", "claims"],
                  properties: {
                    value: { type: "string" },
                    qualifier: { type: ["string", "null"] },
                    claims: { type: "array", items: { type: "string" } },
                  },
                },
                not_in_source: { type: "boolean" },
              },
            },
          },
          nodes: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "label", "claims"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                claims: { type: "array", items: { type: "string" } },
              },
            },
          },
          edges: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["from", "to", "label", "claims"],
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                label: { type: "string" },
                claims: { type: "array", items: { type: "string" } },
              },
            },
          },
          rows: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["cells", "claims"],
              properties: {
                cells: { type: "array", items: { type: "string" } },
                claims: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    },
    dropped: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "reason"],
        properties: { id: { type: "string" }, reason: { type: "string" } },
      },
    },
    problems: { type: "array", items: { type: "string" } },
  },
};

export const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "reason", "offending_text"],
  properties: {
    verdict: { type: "string", enum: ["SUPPORTED", "EMBELLISHED", "DISTORTED"] },
    reason: { type: "string" },
    offending_text: { type: ["string", "null"] },
  },
};
