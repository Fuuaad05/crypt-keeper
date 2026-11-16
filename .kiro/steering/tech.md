# Tech and conventions

## Stack
- React 19, TypeScript (strict), Vite. Plain CSS in `src/styles.css`, no CSS framework.
- No backend. State is a `useReducer` store persisted to `localStorage` under `crypt-keeper:v1`.
- Deploys as a static site on Vercel (`npm run build`, output `dist`).

## Layout
- `src/lib/haunting.ts` holds every pure rule: urgency, mood, sanity, rank, streak, ghost placement. Keep it free of React and DOM so it stays easy to test.
- `src/lib/storage.ts` parses untrusted JSON. Anything read from localStorage or an imported file must go through `parseData`.
- `src/lib/audio.ts` synthesizes all sound with the Web Audio API. Do not add audio files.
- `src/components/*` are presentational. State and side effects live in `App.tsx` and `src/lib/store.ts`.

## Rules
- Run `npm run build` before declaring a task done. It type-checks and bundles.
- No `any`. Prefer narrowing over type assertions.
- Time is passed in as `now: number`. Never call `Date.now()` inside pure helpers.
- Use semantic HTML and visible focus states. Interactive ghosts are real `<button>` elements.
- Do not add dependencies without a reason written in the spec task.
- Never put `.kiro` in `.gitignore`. The hackathon requires it in the repo.
