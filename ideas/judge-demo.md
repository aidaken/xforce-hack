# Judge demo (aim for ~3 minutes)

Works with whichever combo we pick. Swap the passage and the two remake types; keep the beats.

## Setup before they walk up

- One sample passage loaded (see source picks in [product-directions.md](product-directions.md)).
- Two learner profiles ready: ADHD and Dyslexia.
- One teammate is **Source Guard** (has the original printed or on a second screen).

## Script

1. **Goal.** “We gave the agent this: remake this passage for two learners, don’t invent, don’t drop steps.”
2. **ADHD remake.** Click Remix → show checklist/quest. Point at the **decision line**: “chose checklist because this is a 3-stage process and ADHD asked for one-step-at-a-time.”
3. **Dyslexia remake.** Same passage, flowchart, bigger type. Do not re-paste; toggle learner.
4. **Self-check.** Open the fidelity panel. Green claims with source quotes. Mention one yellow/red the agent marked.
5. **Human check.** Source Guard reads two sentences from OpenStax and shows they appear as nodes, nothing extra.
6. **Adapt.** On ADHD, tap “too much text” → agent switches to 3 quest cards live.
7. **The miss.** Source Guard points at the soft phrase the agent invented or oversimplified. “Human caught it; we would not ship that claim.”

## Backup if the model flakes

- Keep a **recorded / cached** good remake of the biology passage.
- Live path is still: toggle learner, show verifier, hit Adapt on a smaller sentence.

## Build order so the demo exists even if we run out of time

1. Static UI with two hardcoded remakes of one passage (already judge-viable).
2. Wire generate + verifier.
3. Wire Adapt.
4. Paste-your-own passage.
5. A second source in a dropdown if time.
