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
