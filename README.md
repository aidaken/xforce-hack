# Study Remix

TAPIA / Capital One 2026 — challenge **[2] Generative AI Neurodiversity-Adaptive Study Workspace**.

GitHub: [aidaken/xforce-hack](https://github.com/aidaken/xforce-hack)

One paragraph in, two remakes out — an ADHD-friendly checklist vs a dyslexia-friendly flowchart — then a source check so we did not invent or drop anything. Same text, two modes, human confirms the original is intact. Student taps **This isn’t working** → the agent switches format.

Working name: **Study Remix**. Direction is drafted here; a few scope questions are still open (see the end of this file and the chat).

## Why this is necessary

Dense textbooks and technical docs are written as long paragraphs. That format is a poor fit for ADHD (working-memory load, no “what do I do next”) and for dyslexia (decoding load, walls of justified text). Existing tools summarize or restyle the same prose. Judges asked for **restructuring**: flowcharts, checklists, or gamified summaries, tailored to the learner, with an agent that **chooses** the format, **checks itself against the source**, and **adapts** when the student says it failed.

We are not diagnosing anyone. Copy in the app: designed around common ADHD / dyslexia study preferences, not clinically proven.

## What the app looks like

**Landing.** Short pitch + **Remix a passage** (demo loads a preloaded OpenStax passage immediately). Optional later: sign in for a saved profile.

**Workspace (the product).** One screen.

- **Left:** source passage (the teammate’s human-check surface).
- **Right:** remake for the active learner (checklist, Mermaid flowchart, or gamified step-reveal).
- **Top:** learner mode / preference toggles, planner rationale (“I chose a flowchart because this is a 3-stage process…”).
- **Bottom / panel:** fidelity report (supported / missing / invented) with source spans and linked highlighting.
- **Adapt:** **This isn’t working** + a reason → re-plan to a different format or granularity.

Demo never depends on live copy-paste: three dataset passages are preloaded.

## Demo we will show judges

Same passage, two different learners, human side-by-side check against the source.

1. Load Cellular Respiration (or another preloaded source).
2. ADHD remake: checklist / one-step-at-a-time.
3. Toggle to dyslexia remake: large-type flowchart (OpenDyslexic or Atkinson Hyperlegible, short labels).
4. Open the fidelity panel. Source Guard teammate confirms nothing was lost or invented.
5. Tap **This isn’t working** → agent switches format live.

Tight ship slice if time is short: **one screen, one OpenStax passage, three buttons. No accounts, no uploads.**

## Features (MVP)

| Feature | What it is |
| --- | --- |
| Login / profiles | Saved learner profiles. **Demo slice may skip this.** |
| Preference profile | Color theme, music, fonts, interests, 3–5 toggles, plus free-text “what trips me up.” |
| Input | Paste text, PDF, or URL. **Always** preload the three challenge passages so the demo cannot fail on paste. |
| Planner agent | Classifies the passage (sequential process / decision logic / definition-heavy), picks a format, shows a **one-line rationale**. That line is what proves it is agentic, not a template. |
| Renderers | Flowchart (Mermaid), checklist, gamified summary (step reveal + quick-check questions). |
| Fidelity checker | Decompose source into atomic claims; map each output element to a source span. Flag unsupported (invented) and uncovered (lost). Show as a report. |
| Side-by-side | Source left, output right, linked highlighting. This is the human-check tool and the judge artifact. |
| Adapt loop | **This isn’t working** + reason → re-plan to a different format or granularity. |
| Lock screen | Optional focus lock for a student-set duration. Feasibility TBD. |

**Do not claim** clinical diagnosis. Do not build a second unrelated product.

### Fonts

**ADHD-oriented (reduce crowding / re-reading)** — [accessibilitychecker.org](https://www.accessibilitychecker.org/blog/the-best-fonts-for-adhd/)

| Font | Why | Use |
| --- | --- | --- |
| Lexend | Built to reduce visual crowding; fluency research | Body, long-form remake text |
| Atkinson Hyperlegible | Distinct characters, less re-reading | Body + UI |
| Verdana | Wide spacing, large x-height, universal | Body, forms |
| Open Sans | Clean, uncrowded, even widths | Web body |
| Arial / Helvetica | Low visual noise | Fallback |
| Georgia | Screen serif, wide tracking | Long-form / print if needed |

**Dyslexia-oriented**

| Font | Why | Use |
| --- | --- | --- |
| OpenDyslexic | Weighted bottoms; letters less likely to flip — [opendyslexic.org](https://opendyslexic.org/) | Dyslexia remake body |
| Atkinson Hyperlegible | High character distinction without a “special” look | UI + captions |

Default pairing unless we change it: ADHD remake in **Lexend**, dyslexia remake in **OpenDyslexic**, chrome/UI in **Atkinson Hyperlegible**.

## Preloaded demo sources

From the challenge prompt. Ship with all three in a dropdown; live demo defaults to biology.

1. OpenStax Biology — Cellular Respiration (3 dense paragraphs)
2. Technical docs — AWS IAM policy evaluation **or** React `useEffect`
3. Dense STEM — OpenStax Calculus §3.6 Chain Rule **or** University Physics §6.3 Gauss’s Law

## Shared Supabase (all branches)

There is **one** hosted project. Use it on `main`, `dev`, `aidar-be`, and every other branch. Do not spin up a second project.

| | |
| --- | --- |
| Name | `xforce-hack` |
| Dashboard | https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr |
| Ref | `tfmzjvoqsktlzwnrzdzr` |
| API | `https://tfmzjvoqsktlzwnrzdzr.supabase.co` |

After clone:

```bash
cp .env.example .env
npx supabase link --project-ref tfmzjvoqsktlzwnrzdzr
npm install
node scripts/check-supabase.mjs
```

Teammate guide: [docs/supabase.md](docs/supabase.md)  
Pinned IDs: [config/supabase.json](config/supabase.json)

## Shared Vercel (all branches)

There is **one** Vercel project. GitHub `aidaken/xforce-hack` is already linked. Do not spin up a second project.

| | |
| --- | --- |
| Name | `xforce-hack` |
| Dashboard | https://vercel.com/aidars-projects-c6143ce8/xforce-hack |
| Project ID | `prj_GXZ75tI8NCSyxSXNFiHanqcIp1Zc` |
| Team | `team_XS9LEdNQcwp4cYraijcCL30b` |
| Production | https://xforce-hack.vercel.app |

After clone:

```bash
npx vercel link --yes --project xforce-hack --scope aidars-projects-c6143ce8
```

Teammate guide: [docs/vercel.md](docs/vercel.md)  
Pinned IDs: [config/vercel.json](config/vercel.json)

Pushes to GitHub create deployments. Feature branches get preview URLs. PR to `dev` — do not push `main`. Put Supabase **anon** / `NEXT_PUBLIC_*` keys on this Vercel project; never the service-role key.

Until the app is scaffolded, `vercel.json` serves `public/` (holding page).

## Repo map

- `ideas/` — earlier pick-list (formats, agent loop, judge demo). Still useful; README is the working MVP.
- `public/` — static holding page deployed on Vercel
- `supabase/` — CLI config, linked to the hosted project above
- `CLAUDE.md` / `CURSOR.md` — living notes for humans and agents (includes Vercel IDs)

Do not commit on `main`. Feature work happens on branches. PRs go to `dev`.

## Open decisions

Not locked yet. Highest-tension items:

1. **Demo slice vs full MVP** — no accounts / no uploads vs login, PDFs, URLs, lock screen.
2. **Two named modes** (ADHD vs dyslexia) vs **preference toggles + free text** as the primary learner model.
3. **Planner picks one of three renderers** vs **always show both ADHD checklist and dyslexia flowchart** for the judge toggle.

Full question list is in the current planning thread; answers should land back here and in `CURSOR.md` / `CLAUDE.md`.
