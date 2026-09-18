# Ideas we could pick

Nothing here is locked. Mix one **product shape**, one **demo text**, one **ADHD remake**, one **dyslexia remake**. Stretch items are optional.

## Product shape (pick one)

### 1. Two-pane Remix studio
Original on the left, remake on the right. Toggle ADHD / Dyslexia. Shows the same passage twice. Closest to what judges asked to see.

### 2. Quest board
Chapter becomes a short game: stages as levels, checkboxes as loot. ADHD-native. Dyslexia path is a high-contrast comic / flowchart of the same levels.

### 3. Dual tutors
Two named agents (`Focus` for ADHD, `Decode` for dyslexia) in chat. Fastest to wire. Weakest visually unless they emit a flowchart/checklist, not just prose.

### 4. Card deck
Agent chunks the passage into swipeable cards. ADHD: one fact per card + progress. Dyslexia: huge type, short lines, optional read-aloud. Same deck, two skins.

### 5. Teacher + student
Teacher pastes the source and hits “make both versions.” Student only sees the remake + “this isn’t working.” Good if we want a human-in-the-loop story that isn’t just the verifier.

### 6. Live compare wall
Big demo screen: original | ADHD | dyslexia | fidelity flags, all at once. Built for walking up to judges. Less of a “study product,” more of a judging artifact.

## Demo source (pick one)

- **Cellular respiration** (OpenStax Biology) — process, easy flowchart + checklist
- **React `useEffect`** — rules and pitfalls, good for “if this, then that” cards
- **AWS IAM policy evaluation** — dense docs, impressive if we don’t butcher it
- **Chain rule** (OpenStax Calculus) — short, high-stakes STEM
- **Gauss’s law** — spatial / diagram-friendly, harder to verify

Could ship respiration as the live demo and keep a second source in a dropdown if time.

## ADHD remake (pick one)

- Numbered checklist, one action per line
- 3-beat quest (“unlock glycolysis → Krebs → ETC”)
- Timer / “do this next” coach (one chunk on screen)
- Kanban: Now / Next / Later for the steps in the passage

## Dyslexia remake (pick one)

- Large-type flowchart, 3–6 word labels
- Syllable-friendly captions under each node (keep real terms: don’t rename pyruvate)
- Off-white + wide spacing + dyslexia-friendly font, same structure as ADHD but not the same layout
- Read-aloud captions + almost no paragraph text

## Agent extras (pick any that fit)

- Agent **says why** it chose flowchart vs checklist vs quest
- Verifier traffic lights: supported / missing / invented, with a source quote
- **This isn’t working** → switch format and retry
- Auto-retry once if the verifier finds an invented claim
- Plant one oversimplification for a human teammate to catch on stage

## Explicitly skip unless we have leftover time

- Accounts, uploads, OCR, PDF libraries
- Clinical / diagnostic language
- Training a model
- More than two learner profiles
- A second full product (don’t build Remix *and* a separate game)

## Example combos (if we want a starting package)

- **Judge-safe:** shape 1 + respiration + checklist + flowchart + verifier + adapt
- **Showy:** shape 2 + respiration + quest + comic flowchart + verifier
- **Speed run:** shape 3 + `useEffect` + checklist + large-type bullets + human check only
