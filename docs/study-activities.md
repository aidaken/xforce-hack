# Portable study activities and Unfold prototype

Charlotte's guided reading (`<reading-coach>`), basketball (`<study-hoops>`), alpaca house (`<alpaca-house>`), and study-video sidekick (`<study-video>`). ADDY copies these files as-is. Guided reading + hoops/house mount after ingest; **Playful** in Quick settings mounts the Subway Surfers sidekick.

## Preview

Run the repository's existing `npm run dev`, then open the paths below on the printed local address. Include the HTML filename (the local server does not resolve subdirectory indexes).

- Full learning interface and profile: `/study-activities/index.html`
- Subway Surfers sidekick: `/study-activities/components/demo.html`
- Reading reward basketball: `/study-activities/components/ball-demo.html`
- Alpaca house: `/study-activities/components/house-demo.html`
- Guided reading (representation theory sample): `/study-activities/components/reading-coach-demo.html`

These same static paths are available when this branch is deployed. Pushing this branch alone does not merge or deploy it to main.

## Integration

All activities use browser custom elements with isolated styles. Copy their component files into another website, or reference them at the paths above. Full usage examples are in [the component README](../public/study-activities/components/README.md).

- Video: `study-video.js` and `<study-video>`. Optional YouTube embed; loads on play. No downloaded video.
- Basketball: load `study-ball.js` before `study-hoops.js`, then use `<study-hoops>`. Call `setSectionsCompleted(total)` with a cumulative section count. Listen for `basket-scored` to observe rewards. The base `<study-ball>` remains available for free play.
- House: `alpaca-house.js`, its sibling `assets/` directory, and `<alpaca-house>`. Call `completeReading({id, title, topic})` when a full reading finishes. Stable IDs prevent duplicate rewards. Use `open()` at a suitable stopping point; completion does not open it automatically.

The house defaults to a quiet room with one Add to my house action. Arrange is optional. Decorations persist in localStorage; use the `storage-key` attribute to isolate houses. The profile also supports optional local storage. There are no accounts or cloud saves in this prototype.

## Prototype boundaries

The learning planner, source checks, and adaptations use scripted sample content. The house includes a prepared AI-generated alpaca Mona Lisa for `italian-renaissance-chapter`; arbitrary topic image generation requires assigning `house.generateReward`, backed by your own server endpoint. Do not put API keys in browser code. Image assets and generation prompts are included.

## Validation

The original prototype was checked in-browser for video playback and controls, drag and keyboard ball interactions, scoring and throw balance, profile application, and house placement/persistence. Physics trajectories were checked at phone and desktop sizes. JavaScript syntax was checked before copying.
