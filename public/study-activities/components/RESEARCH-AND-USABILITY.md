# Guided reading: evidence and usability review

Reviewed 18 September 2026. This is a research-informed prototype, not a clinically validated ADHD intervention. The new demo uses authored content and deterministic adaptations, not an AI model. No learner study has been conducted.

## What was built

`reading-coach.js` is a dependency-free custom element with isolated styles. It shows one section at a time, offers an optional check, gives corrective feedback, switches to explicit steps on request or after an incorrect answer, exposes original wording, and restores a reading checkpoint after a reload. A final optional recall asks the learner to connect the whole reading. Completion and check outcomes are recorded separately. Nothing is timed.

The standalone demo follows Unfold's existing cream, sage and forest-green template. Games are available through a quiet link after completion; they do not animate or open during the reading.

## Evidence and honest claims

| Design choice | Evidence | What we can reasonably say |
| --- | --- | --- |
| Optional retrieval before revealing feedback | Knouse, Rawson, Vaughn & Dunlosky (2016), *Does Testing Improve Learning for College Students With ADHD?* College students with ADHD (n=25) and without ADHD (n=75) learned categorized word lists; testing benefited recall two days later in both groups. [Article abstract and DOI](https://www.psychologicalscience.org/journals/clinical/2167702614565175/) | Self-testing has direct ADHD-specific support in this setting. Our multiple-choice questions, short biology text and one-session experience are different; the study does not validate our app or establish mastery from one correct answer. |
| Whole-reading recall, alongside section checks | Stern & Halamish (2023), *Free-recall retrieval practice tasks for students with ADHD: whole-text versus section recall*. Whole-text recall outperformed section recall on delayed proportional recall; neither retrieval condition outperformed restudying. [Primary study](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1301726/full) | Do not claim that smaller chunks always produce better retention. Our final recall is an opportunity to connect ideas; section checks offer local feedback. This mixed finding is a reason to test the learning outcomes of the combined flow. |
| Clear next action, manageable sections, breaks and feedback | CDC classroom guidance recommends clear assignments, shorter nonrepetitive tasks, breaks, minimizing distractions and organizational tools. It notes limited evidence for specific accommodations. [CDC](https://www.cdc.gov/adhd/treatment/classroom.html) | These are reasonable classroom-informed supports. Guidance for children does not prove benefits in a college web app. The exact chunk size needs learner testing. |
| Quiet rewards and user-controlled adaptation | CDC advises asking the student what helps or distracts them. W3C recommends user control of interruptions and a quiet environment. [CDC](https://www.cdc.gov/adhd/treatment/classroom.html), [W3C cognitive accessibility guidance](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p01-minimal-interruptions/) | Offer choices without prescribing one ADHD mode. Avoid automatic reward panels, sound or movement during study. W3C is design guidance, not an efficacy trial. |
| Help me restart | A saved location, last-idea recap and concrete next action apply organizational and focus guidance. [W3C focus objective](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/) | A design hypothesis that may reduce the work of finding one's place. We have not demonstrated an ADHD-specific learning benefit from this feature. |
| Original wording and explanation of changes | The component verifies that the declared highlighted quote exists in its supplied source. | A transparency and error-inspection feature. Exact string matching does not establish semantic fidelity, detect all omissions, or prove that a generated explanation is correct. |

## Existing activities: usability assessment

- **Video during study:** keep opt-in, paused until requested, with an obvious stop control. We found no direct evidence here that watching Subway Surfers while reading improves ADHD learning. Treat it as an optional preference, not a research-backed intervention. Its effect should be measured on comprehension, not just enjoyment.
- **Ball and basketball:** suitable candidates for an optional break after a section. Avoid moving controls over learning content, automatic launches and forced reward interruptions. The new coach emits events that a host can use to bank rewards silently. Existing activities were not comprehensively retested in this audit.
- **Alpaca house:** retain the simple earned-item → add → return flow. Decorate only on request. An item can carry a recall prompt as a future experiment; no claim that collecting decor improves retention is currently justified.
- **Profile:** ask about preferred supports and allow changes. A diagnosis alone should not automatically determine typography, visual format or stimulation level. The new component does not collect diagnoses or automatically import the main profile; the host can map preferences through its styling variables.

## Usability inspection and verification

This was a developer heuristic review and browser walkthrough, not a study with ADHD participants or a full accessibility conformance audit.

Implemented safeguards:

- One primary action per stage. Source text is behind a labeled disclosure. No countdown, streak, score ranking, modal reward or ambient animation.
- Incorrect answers lead to a clearer explanation rather than a blocked lesson. Skips remain distinct from correct answers and reviewed explanations.
- Native radio groups with a question legend, native disclosure, labeled notes field, visible focus indicators, and programmatic heading focus after transitions. Buttons have at least 44px minimum height.
- Progress is saved in sessionStorage. Storage failure falls back to in-page state with truthful copy. Notes are not persisted or transmitted.
- Explanations render as escaped text; arbitrary lesson HTML is not inserted. Invalid source quotes are rejected.

Verified with the browser: reading → wrong answer → adapted explanation; reload → correct checkpoint; continue without a check. Inspected the desktop layout and a 390px phone viewport; no horizontal page overflow was observed. Spacing was reduced after the initial desktop inspection to bring actions closer to the passage. Viewport override was reset after testing.

Automated state tests cover invalid source references, empty submissions, wrong-answer adaptation, stale Next actions, restored checkpoints, skipped versus correct outcomes, completion emitted once, no completion replay on reload, malformed saved state, and blocked storage.

Remaining evaluation: assistive-technology testing with a screen reader; 200–400% zoom and forced colors; broader devices; co-design with ADHD students. Completion events are client-side signals, not verified learning or tamper-resistant reward accounting. Session restoration is tab/browser dependent, not cross-device persistence.

## A useful hackathon evaluation

Recruit consenting target users and counterbalance two comparable passages between the original interface and guided reading. Ask them to resume after an interruption, change an explanation, locate original wording and finish a reading. Observe wrong turns, time to resume, perceived effort and autonomy. Include immediate and delayed comprehension questions; do not substitute time-on-site, clicks or collectible counts for learning. Report small-sample observations without claiming clinical efficacy.

Suggested pitch: “We make the next learning action clearer, let the learner request a different explanation, and make it easy to inspect the source and resume after an interruption. The design is informed by ADHD learning research; its effectiveness still needs user evaluation.”
