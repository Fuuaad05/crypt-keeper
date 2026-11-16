# Design: Crypt Keeper

## Architecture
Single-page React app, no server. A reducer holds `{ tasks, settings }`, persisted to localStorage on every change. A `useNow` hook refreshes the clock every 15 seconds and when the tab becomes visible, which drives all time-based visuals.

```
App.tsx (state, effects, routing between views)
 ├─ Hud            sanity, rank, streak, counters
 ├─ Graveyard      scene, ghosts, lantern, rings
 │   └─ Ghost      SVG face by mood
 ├─ DetailCard     selected ghost actions
 ├─ Ledger         grouped list
 ├─ Tombstones     banished history
 ├─ TaskForm       modal for create and edit
 └─ Menu           settings, import and export
lib/
 ├─ haunting.ts    pure rules (urgency, mood, sanity, rank, streak, placement)
 ├─ storage.ts     load, save, parseData, ICS builder
 ├─ store.ts       reducer and useStore
 ├─ audio.ts       Web Audio synthesis
 └─ demo.ts        sample ghosts and id generation
```

## Key formulas
- `horizon(effort) = (5 + 2 * effort)` days.
- `urgency = clamp(1 - timeLeft / horizon, 0, 1)`, and 1 when overdue.
- Placement radius `r = max(1 - 0.8 * urgency, 0.3)`. Overdue ghosts sit on an inner ring at `0.2 + 0.07 * (i % 3)`.
- Angle is spread evenly across 14 to 166 degrees by creation order, with a small hash-based jitter, so ghosts do not stack.
- Sanity is `100 - drain`. A wraith drains `14 + 2 * effort`. A ghost due within 24 hours drains `4 + effort`. Within 3 days it drains `1 + floor(effort / 2)`.

## Data model
`Task { id, title, course, due, effort, notes, createdAt, completedAt | null }`. Completion is a timestamp, which gives history, streaks and the in-time check for free.

## Error handling
- `parseData` validates every field and drops bad tasks, so a corrupt backup cannot crash the app.
- Storage failures are swallowed. The app keeps running in memory.
- Audio and Notification APIs are feature-detected.

## Correctness properties (candidates for property-based tests)
1. Urgency is always in [0, 1] and never decreases as `now` increases.
2. A task due in the past always has mood `wraith`.
3. Sanity is always in [0, 100], and banishing a task never lowers it.
4. `parseData(JSON.parse(JSON.stringify(data)))` returns equivalent data.
5. Streak never exceeds the number of distinct completion days.
