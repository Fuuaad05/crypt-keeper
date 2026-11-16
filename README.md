# Crypt Keeper

**Every deadline is a ghost. Finish the work to banish it.**

Crypt Keeper is a haunted deadline tracker for students. Each assignment becomes a ghost in a graveyard. As the due date approaches, the ghost drifts toward your lantern and its face turns from calm to furious. Miss the deadline and it becomes a wraith that drains your sanity. Finish the work and the ghost is banished.

Built for **Kiroween 2026**, Costume Contest category, with [Kiro](https://kiro.dev).

## The spooky UI does real work
| What you see | What it means |
| --- | --- |
| Distance from the lantern | How close the deadline is |
| Ghost size | Effort ("dread level") |
| Ghost colour | Course |
| Ghost face | Calm, uneasy, angry (under 24h), wraith (overdue) |
| Lantern glow and red vignette | Your sanity, a live summary of how overdue you are |

## Features
- Graveyard scene, plus a plain Ledger list and a Tombstones history
- Add, edit, delete, banish, undo and revive
- Course filters, rank, day streak and sanity
- Synthesized sound effects and ambient wind (Web Audio, no audio files), both optional
- Optional browser notifications when a ghost is within 24 hours or overdue
- JSON backup and import, and `.ics` calendar export with a 24h alarm
- Keyboard friendly (press `N` to summon), visible focus, `prefers-reduced-motion` support
- No account and no backend. Data stays in your browser

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build into dist/
```
Open `/?demo=1` on an empty crypt to load sample ghosts.

## Deploy to Vercel
Import the repo on Vercel. It detects Vite automatically (build `npm run build`, output `dist`). No environment variables are needed.

## How Kiro was used
See [`.kiro/`](.kiro):
- `steering/` holds the product, tech and design rules Kiro followed.
- `specs/crypt-keeper/` holds the requirements, design and task list.
- `hooks/` holds a typecheck-on-save hook, an agent hook that keeps the scene geometry and SVG rings in sync, and a build-after-task hook.

## License
[MIT](LICENSE)
