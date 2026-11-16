# Visual design

## Direction: the night watch
A near-black page with one lantern. No gradients between colours, no blur, no glow except the lantern's light and the red warning on wraiths. The landing page hero is the real graveyard, running live.

## Palette
- Page: `#0a0a0b`. Panels: `#14130f`. Text: bone `#efe8d8`. Muted: `#968f7f`.
- Amber `#f2b84b` for the lantern, the primary button, and focus. Nothing else is amber.
- Danger red `#e5484d` only for overdue items and low sanity.
- Course colours come from the fixed warm palette in `courseColor()`.

## Type
- Fraunces (weights 400, 400 italic, 900) for headlines and numbers.
- IBM Plex Mono for times, labels and small data.
- System UI for body text and controls, for legibility.

## Landing page
- Hero: left column has the headline and one primary button ("Open the crypt"). Right column is a live scene built with the same `placeGhosts`, `moodOf` and `formatLeft` rules as the app.
- Below it: a field guide to the four moods, then four short key/value explanations, then what you do about it, then one more button.
- Copy is specific and plain. No marketing verbs.

## Motion
- Ghosts bob. Angry ghosts shake. Wraiths shake faster and glow red. Banishing dissolves in 850 ms.
- All motion collapses under `prefers-reduced-motion: reduce`.

## Layout rules
- The scene uses a half-ellipse around the lantern. Placement math in `placeGhosts` and the SVG ring sizes must stay in sync (x radius 44, y radius 74, centre 50% / 86%).
- Never rely on colour alone. Mood is also shown by the face and the time label.
