# XForce Hackathon Project
Team project for Capital One Hackathon at TAPIA.

## These are the base slides for the presentation

`design/addy-deck.html` is the slide harness — open it in a browser, no server needed.

---

#### Controls

spacebar/down arrow/right arrow to advance the slide
up arrow/left arrow to go back one slide
1–9 jump straight to a slide
g opens the slide menu, f toggles fullscreen

---

#### Editing

Each slide is its own file in `design/` (`Main.dc.html` … `Team.dc.html`),
laid out by `design/canvas.json`. After editing any of them, run:

```
node design/build-deck.mjs
```

That regenerates `design/addy-deck.html`. Don't edit the deck file directly —
it is generated and your changes will be overwritten.
