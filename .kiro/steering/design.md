# Visual design

## Palette
- Background: deep indigo to near black (`--bg`, `--bg-2`).
- Accent: moonlight lavender `#c9b8ff`. Gold `#ffcf70` is reserved for the lantern, rank and focus.
- Danger: `#ff5d73`, used only for overdue items and low sanity.
- Course colours come from a fixed palette in `courseColor()`, picked by hashing the course name.

## Type
- Display: Cinzel for headings and numbers.
- Body flavour text: IM Fell English.
- Controls and dense data: the system UI font, for legibility.

## Motion
- Ghosts bob. Angry ghosts shake. Wraiths shake faster and glow red.
- Banishing plays a 850 ms dissolve with a rising chime.
- All motion collapses under `prefers-reduced-motion: reduce`.

## Layout rules
- The scene uses a half-ellipse around the lantern. Placement math in `placeGhosts` and the SVG ring sizes must stay in sync (x radius 44, y radius 74, centre at 50% / 86%).
- Never rely on colour alone. Mood is also shown by the face and the time label.
