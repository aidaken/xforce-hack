# CornerFeed — the split-attention video widget

A muted gameplay clip pinned to a corner of the screen, cropped to a 9:16 short and
looping forever. The "Subway Surfers in the corner" format, which is the native
attention pattern a lot of ADHD students already study with.

One file: [`app/src/components/CornerFeed.jsx`](../app/src/components/CornerFeed.jsx).
No CSS file, no store, no context, no new dependency. Nothing else in the repo
imports it yet, so it cannot break anything that already works.

## Use it

```jsx
import CornerFeed from "./components/CornerFeed.jsx";

// anywhere in the tree — it pins itself to the viewport
<CornerFeed />
```

To put it only on the reading screen, render it inside `Reading.jsx`. To have it
follow the student everywhere, drop it in `App.jsx` next to `<AppHeader />`.

### Props

| Prop | Default | What |
| --- | --- | --- |
| `feeds` | two clips (below) | `[{ id, name, start, rate }]` |
| `defaultSize` | `"md"` | `sm` 150px · `md` 210px · `lg` 290px |
| `corner` | `"bottom-right"` | any of `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `showControls` | `true` | `false` gives a bare frame with no chrome at all |
| `respectReducedMotion` | `true` | see below |

### Feeds

```js
{ id: "u7kdVe8q5zs", name: "Minecraft parkour", start: 0, rate: 1.25 }
```

`id` is the YouTube video id. `start` is the in-point **and** the point the loop
returns to. `rate` is playback speed — YouTube supports 0.25 to 2 in 0.25 steps.

Shipped defaults: Subway Surfers from 0:30 at 1×, Minecraft parkour from 0:00 at
1.25×. The Minecraft clip is published as "No Copyright", which matters if we ever
want to self-host instead of embed.

### Reserving space so it doesn't cover text

The widget publishes its own width as a CSS variable on `:root`:

```css
.myLayout { padding-right: var(--corner-feed-width, 0px); }
```

It updates on resize, minimise and hide, so the gutter closes when the feed does.

## Behaviour worth knowing

**Reduced motion.** An autoplaying clip is precisely what a `prefers-reduced-motion`
user is asking not to receive, so under that setting the feed loads paused and says
so. Pass `respectReducedMotion={false}` to always autoplay.

**Minimise vs hide.** Minimise shrinks it to 82px and *keeps it playing* — the point
of the feature is continuous motion. Hide stops playback entirely and leaves a "Show
feed" pill.

**Sound.** Starts muted, because browsers refuse to autoplay with sound. The Unmute
button is there but nothing unmutes on its own.

## Three things that will bite you if you rewrite this

These are all load-bearing. They were each found by breaking them.

1. **`onYouTubeIframeAPIReady` fires exactly once, and can fire before your component
   mounts.** On a warm cache you get `YT.Player` available but no player, which looks
   exactly like a blocked embed. The component checks for an already-loaded API,
   listens for the callback, *and* polls — all three, sharing one promise.

2. **`setPlaybackRate` is wiped by every `loadVideoById`.** Setting it once at setup
   works on first load and silently fails on every feed switch. It is reasserted on
   each `PLAYING` event.

3. **`loop: 1` restarts at 0 and ignores the `start` param.** The loop back to the
   in-point is done by hand on the `ENDED` event.

## Hiding YouTube's own chrome

`controls: 0` removes the control bar and `pointer-events: none` on the iframe kills
every hover overlay. But YouTube still paints its **title bar, centre play/pause
button, next/prev arrows and a "More videos" strip** whenever the player is *not
playing* — so they flash during load, during buffering, and on every feed switch.

The fix is the opaque panel over the frame, lifted only on `PLAYING`. Two details
make it work: it must appear **instantly** (a fade-in lets the title show through it),
and it must lift ~200ms **late**, after YouTube's overlay has cleared.

## Known limits

- **Network stalls.** During testing the embed wedged in permanent `BUFFERING` on both
  clips after many rapid reloads, unresponsive even to an explicit `playVideo()`, then
  recovered on its own. Almost certainly YouTube throttling. It is the same failure
  shape that would spoil a live demo on conference wifi.
- **The only real guarantee** of zero chrome and zero stalls is a self-hosted mp4 in a
  plain `<video>` tag. That trades the embed's licensing cover for a hosting and
  rights problem, which is why this uses the embed.
- YouTube's API terms ask that the player not be obscured. A load-state cover like
  this is common practice, but it is worth knowing before it goes in front of judges.
