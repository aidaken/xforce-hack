# Agentic loop (the part that isn’t a wrapper)

The product is a loop, not a single prompt.

```
goal: remake this passage for learner L
  → 1. Perceive   (parse passage, tag concept type)
  → 2. Decide     (pick format + constraints for L)
  → 3. Produce    (write the remake)
  → 4. Check      (align every claim to a source span)
  → 5. Adapt      (if student or verifier says fail, pick a different format and retry)
```

## 1. Perceive

Classify the passage as one of:

- **process** (steps in order) → flowchart or checklist
- **rule system** (if/then, exceptions) → decision tree
- **definition cluster** (terms + relations) → labeled diagram / glossary cards

Cellular respiration = process. IAM policy eval = rule system. Chain rule = process + definition.

## 2. Decide

Inputs: `learner`, `concept_type`, optional `last_failure_reason`.

Examples:

| Learner | Process | Rule system |
| --- | --- | --- |
| ADHD | short checklist + 3-beat quest, one idea per card | “if this, do that” cards, no walls of text |
| Dyslexia | flowchart with short labels, high contrast, no dense paragraphs | same tree, spoken-friendly words, extra spacing |

The decision must be **visible in the UI** (“I chose a flowchart because this is a 3-stage process and the dyslexia profile asked for spatial structure”). Judges need to see the agent *choose*.

## 3. Produce

Hard constraints in the prompt:

- Do not add facts that are not in the source.
- Do not drop named steps, numbers, or conditions.
- ADHD: max ~12 words per bullet, progress/quest framing OK.
- Dyslexia: avoid justified walls of text; use large type, short lines, consistent terms (don’t rename “pyruvate” to something cute).

## 4. Check (second pass, same or second agent)

For each bullet / node in the remake:

- `supported` — quote the source span
- `missing` — fact in source that never appeared
- `invented` — remake claim with no source span

Show this as a traffic-light list next to the original. This *is* the “nothing lost or invented” panel.

If `invented` or important `missing` → auto-retry once before showing the student.

## 5. Adapt

Student taps **This isn’t working** and picks a reason:

- too much text
- too gamey / not serious
- I lost the sequence
- words are still hard to read

Agent stores that as `last_failure_reason`, **changes format**, and reruns 2–4. Example: ADHD checklist → quest cards; dyslexia flowchart → audio-first short captions.

## Human catch (plan this)

Leave one slightly soft paraphrase in the first remake (e.g. “makes a lot of ATP” where the source said a specific yield). Human teammate flags it on the fidelity panel during the demo. That satisfies the global “agent got something wrong” bar without tanking the product.
