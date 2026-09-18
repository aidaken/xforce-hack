# Challenge 2 — what we actually have to hit

## One-line brief

Turn dense textbook / docs into ADHD- and dyslexia-friendly remakes, with an agent that **chooses the format**, **checks itself against the source**, and **adapts when the student says it failed**.

## Must-haves (from the prompt)

1. **Restructure**, not summarize-and-pray. Output should be a flowchart, checklist, or gamified summary (or a mix).
2. **Tailor** to ADHD *or* dyslexic learning styles — two real modes, not a font toggle.
3. **Agentic loop**
   - decide *which* restructuring fits this material + this learner
   - produce it
   - check the output against the source
   - adapt when the student says it isn’t working
4. **Human-in-the-loop**: a teammate confirms nothing was lost or invented.

## What judges must see

- The **same passage**, rendered **two different ways**, for **two different learners**.
- A **side-by-side human check** vs the source: no dropped facts, no invented facts.

Hackathon-wide: also show something the **agent got wrong** and how a **human** caught it. Plan for that on purpose.

## Suggested source texts (pick one for the live demo)

- **Biology (best default):** 3 dense paragraphs from OpenStax Biology, Cellular Respiration — [openstax.org](https://openstax.org/)
- **Docs:** [AWS IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) or [React `useEffect`](https://react.dev/reference/react/useEffect)
- **STEM:** OpenStax Calculus Vol. 1 §3.6 Chain Rule, or University Physics Vol. 2 §6.3 Gauss’s Law

Strong default if we don’t want to debate: Cellular Respiration (clear process → flowchart *and* checklist both work). Other picks are listed in [product-directions.md](product-directions.md).
