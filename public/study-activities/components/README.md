# Portable guided reading

Open `reading-coach-demo.html` for the new quiet guided-reading flow. Copy **reading-coach.js** into any website, then supply reviewed lesson data:

```html
<script src="/components/reading-coach.js" defer></script>
<reading-coach id="coach"></reading-coach>
<script>
customElements.whenDefined('reading-coach').then(() => {
  document.querySelector('#coach').lesson = myReviewedLesson;
});
</script>
```

Use `reading-coach-sample.js` as the lesson schema example: stable `id`, `version`, `title`, optional `topic`, and sections with unique `id`, `title`, `source`, exact `quote`, `summary`, `steps`, `change`, `recap`, and a `question` containing `prompt`, `options`, zero-based `correct`, and `explanation`. Assignment validates the schema and quote matches and throws on invalid data. Adaptations are supplied content; this component does not call an AI service or evaluate arbitrary answers.

Styles use Shadow DOM. No framework, font download, build step or network call is required by the component. The demo shell reuses the main site's stylesheet/fonts. Set `--coach-font` (a full CSS font shorthand), `--coach-paper`, `--coach-ink`, and `--coach-accent` on the element to match another host or reading preference. Check contrast after overriding colors.

Progress is tab-session scoped by lesson ID/version; optional `storage-key` gives a separate namespace and should be set before assigning the lesson. Change `version` when content changes. It stores stage, section index and check outcomes, not diagnosis or notes. No completion event is replayed after restoration. Handle account boundaries and durable storage in the host if needed.

Bubbling, composed integration events:

| Event | Detail |
| --- | --- |
| `section-completed` | `lessonId`, `sectionId`, cumulative `completed`, `outcome` (`checked`, `reviewed`, `skipped`), stable `eventId` |
| `reading-completed` | `id`, `title`, `topic`, `outcomes`, stable `eventId` |
| `reading-adapted` | Learner-requested `lessonId`, `sectionId`, `format`, `reason` |

For example, bank throws without opening a game:

```js
coach.addEventListener('section-completed', ({detail}) => {
  // Single-lesson demo. For many lessons, maintain a host-wide deduplicated total.
  document.querySelector('study-hoops')?.setSectionsCompleted(detail.completed);
});
coach.addEventListener('reading-completed', ({detail}) => {
  // Show a quiet optional reward action; do not open a modal automatically.
  // Pass detail to house.completeReading only when a matching reward provider exists.
});
```

The included demo only shows an optional link to the existing basketball demo after reading completion. It does not wire cross-page balances or generate a biology collectible. Host applications should deduplicate `eventId` in durable storage for real rewards; client-side events are not proof of learning. `[reading-coach].state` is an implementation detail, not a stable integration API.

See [research and usability notes](RESEARCH-AND-USABILITY.md) for evidence, limitations and the evaluation checklist. Run the local state tests from the prototype root: `node tests/reading-coach.test.cjs`.

# Portable study video

Copy `study-video.js` into another website and add:

```html
<script src="/components/study-video.js" defer></script>
<study-video video-id="7ghSziUQnhs" corner="right"></study-video>
```

No framework, build step, API key, or CSS dependency. Styles are isolated in Shadow DOM. Use `corner="left"` for the other corner. Override `--study-video-accent` on the element to change the accent color. The `video-id` is a YouTube video ID (set before first playback).

The button opens a small panel. Play loads the YouTube IFrame API and privacy-enhanced embed on demand, starts muted, and loops the selected video. Native YouTube controls and custom play/pause and mute controls are available. Move switches corners; resize enlarges the video; close or Escape destroys the player and stops playback. Removing the component also destroys the player. Reopening starts from the beginning.

Serve over HTTP(S), including localhost. YouTube can require a valid HTTP referrer and may block embeds in some browsers or for some videos. The component provides errors, retry, and a link to the original video. Playback needs internet access and remains subject to YouTube availability, advertising, and embedding rules. It does not download or rehost footage.

Default footage: https://www.youtube.com/watch?v=7ghSziUQnhs
API reference: https://developers.google.com/youtube/iframe_api_reference

Open `demo.html` through an HTTP server to try this component outside Unfold.

## Portable bouncy ball

Copy just `study-ball.js` and add these two lines to any page:

```html
<script src="/components/study-ball.js" defer></script>
<study-ball></study-ball>
```

The ball uses an isolated Shadow DOM, no framework, no assets, and no network calls. Drag and release to throw it. Toss launches it instantly; Pause/Resume freezes physics; Reset puts it back; Hide removes it until Show is selected. With the ball focused, arrow keys throw, Space pauses, and R resets. Pointer capture supports dragging with a mouse, touch, or pen without scrolling the page.

Physics use fixed 120 Hz steps, gravity, velocity estimated from the last 110 ms of dragging, air resistance, damped edge collisions, floor friction, and a sleep state after settling. Rendering uses requestAnimationFrame; it stops while hidden, paused, settled, or the document is not visible. Resize clamps the ball into the new viewport. Reduced-motion users start with the ball paused and can choose Toss or Resume.

Only the ball and its small control bar receive pointer events; the rest of the viewport remains clickable. The ball collides with viewport edges, not page content or other widgets. Its initial diameter is 60px. Set `--study-ball-color` on the element to customize its main color. Place the component directly under body, outside transformed containers, to keep its fixed position aligned with the viewport.

Open `ball-demo.html` for a standalone demo. This also works as a local HTML file.

## Reading rewards: basket + earned throws

Use `<study-hoops>` instead of `<study-ball>` to enable the reward game:

```html
<script src="/components/study-ball.js" defer></script>
<script src="/components/study-hoops.js" defer></script>
<study-hoops sections-completed="0"></study-hoops>
```

Each increase in the cumulative completed-section counter awards one throw per new section. Repeated values or decreases do not award more throws. State lasts for the current page visit. Connect your reading progress with either:

```js
const game = document.querySelector('study-hoops');
game.setSectionsCompleted(3); // cumulative total, not an increment
// Or: game.setAttribute('sections-completed', '3');
game.addEventListener('basket-scored', event => console.log(event.detail));
game.addEventListener('throws-earned', event => console.log(event.detail));
```

The demo button increments this same counter. The basket appears while throws are available or a shot is active. Drag/release consumes one throw; clicking without dragging does not. The Shoot button provides an assisted arc for keyboard users. A shot scores once when the ball crosses the rim downward inside the opening. It ends at the floor or after eight seconds of simulated time. Reset ends the attempt without refunding it. Hide and Pause preserve the current attempt. Confetti is a short, non-interactive burst; reduced-motion users get a static success message. The original `<study-ball>` stays available for unrestricted play.

Free throws have their own tuning: 980px/s² gravity, lighter air resistance, and less energetic wall rebounds. The hoop is above and to the right of a closer shooting position. Upward swipes toward the hoop receive a forgiving launch assist, including slow drags; their subsequent flight follows the physics simulation without steering. The unrestricted ball retains its original physics.

## Alpaca house: a keepsake for each full reading

Copy `alpaca-house.js` and its sibling `assets/` folder into another site. No framework, CSS library, or build step is required.

```html
<script src="/components/alpaca-house.js" defer></script>
<alpaca-house storage-key="my-site-reading-house"></alpaca-house>
```

Call this when an entire reading is completed (not each section):

```js
await customElements.whenDefined('alpaca-house');
const house = document.querySelector('alpaca-house');
await house.completeReading({
  id: 'italian-renaissance-chapter', // Stable ID prevents duplicate rewards.
  title: 'The Italian Renaissance',
  topic: 'Italian Renaissance'
});
house.open();
```

The included Renaissance example reveals the prepared AI-generated Mona Llama painting. It does not call an AI service at runtime. For other readings, assign an async generator function that returns `{title, description, imageUrl}`. Implement that endpoint on your own backend and keep API keys there:

```js
house.generateReward = async reading => {
  const response = await fetch('/api/reading-keepsake', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reading)
  });
  if (!response.ok) throw new Error('Could not create your keepsake. Try again.');
  return response.json();
};
house.addEventListener('keepsake-earned', event => {
  console.log(event.detail.readingId, event.detail.item);
});
```

Suggested backend generation brief: create one recognizable collectible inspired by the reading's topic, reimagined for an alpaca world; isolate the object on a transparent background; no labels or UI. Use permanent image URLs rather than expiring links, since collections reference these URLs.

The default experience is deliberately quiet: a room, a short reward message, and one “Add to my house” button that places the reward automatically. Once placed, “Back to reading” is the main action. There are no counters, visible shelves, resizing controls, or upkeep tasks. “Arrange” optionally enables dragging and arrow-key placement; decorations are static otherwise. Existing saved keepsakes and layouts remain compatible.

Collections and placements are saved to localStorage under the chosen key. No reading text or disability information is stored. Storage failure falls back to the current visit with a visible notice. There is no server persistence or account; storage is shared by tabs on the same origin, with updates read when reloading. Each instance should use a distinct key if separate houses are desired. `completeReading` does not automatically interrupt the reader with a modal; the host controls when to call `open()`.

`house-demo.html` opens the feature standalone. Add the `open` attribute to show the house immediately. The two included assets and their ImageGen prompts are documented in `assets/GENERATION.md`.

## Addy companion: a pet that wanders behind the page

Copy `addy-pet.js` and its sibling `assets/addy/` folder (ten PNGs, ~570 KB). No framework, CSS, build step, or network call beyond the images.

```html
<script src="/components/addy-pet.js" defer></script>
<addy-pet></addy-pet>
```

Put the tag inside the element whose background she should walk on: `<body>`, or an app root that paints its own full-page background. She sits between that element's background and its content (the element becomes a stacking context if it is not one already). The Addy React app mounts her inside `.addy` via `app/src/components/AddyPet.jsx`.

Addy walks to random points across the whole viewport, rests in a pose (pointing or thinking, randomly flipped), then sets off again. She is always behind the page content: anything with a background paints over her, and she can be grabbed wherever she shows through. Dragging lifts her (celebrating or thinking pose), release drops her with a small landing squash, and she resumes from there. Clicks on links, buttons, and form controls are never intercepted, and the page keeps scrolling normally unless she is being held.

Attributes: `size` (width in px, default 120), `speed` (px/s, default 100), `paused`, `assets` (base URL of the art folder). Methods: `pause()`, `resume()`, `goTo(x, y)`. She keeps moving under `prefers-reduced-motion`; use `paused` if a host wants her still. The loop stops while the tab is hidden. Art is `walk1-6.png` (8 fps cycle), `pointing`, `thinking`, `celebrating`; frames face right and walking left is a CSS flip.

Open `addy-demo.html` for a standalone page with speed and pause controls.
