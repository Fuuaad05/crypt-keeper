import { useMemo } from "react";
import type { Task } from "../types";
import { DAY, HOUR, courseColor, formatLeft, moodOf, placeGhosts } from "../lib/haunting";
import { useNow } from "../lib/useNow";
import { GhostDefs, GhostSvg } from "./Ghost";

interface Props {
  onEnter: (withSamples: boolean) => void;
}

/** Five example ghosts for the hero. They use the real placement and mood rules, so the hero is honest. */
function heroTasks(now: number): Task[] {
  const rows: Array<[string, string, number, 1 | 2 | 3 | 4 | 5]> = [
    ["OS lab report", "CS 301", -2 * HOUR - 14 * 60_000, 4],
    ["Group slides", "BUS 150", 5 * HOUR + 12 * 60_000, 3],
    ["Gothic Novel essay", "ENG 210", 4 * DAY + 5 * HOUR, 5],
    ["Statistics midterm", "STAT 220", 8 * DAY, 5],
    ["Lab 4: circuits", "PHYS 101", 11 * DAY, 2],
  ];
  return rows.map(([title, course, offset, effort], i) => ({
    id: `hero-${i}-${title}`,
    title,
    course,
    due: now + offset,
    effort,
    notes: "",
    createdAt: i,
    completedAt: null,
  }));
}

const MOODS = [
  {
    mood: "calm",
    name: "Calm",
    rule: "More than half your window left",
    text: "It drifts at the edge of the graveyard and hums to itself. You have time, and it knows you know.",
  },
  {
    mood: "uneasy",
    name: "Uneasy",
    rule: "Less than half your window left",
    text: "It has noticed you. Its eyes go round. This is the moment to open the textbook, not tomorrow.",
  },
  {
    mood: "angry",
    name: "Angry",
    rule: "Under 24 hours",
    text: "Eyebrows down, body shaking. It is close to your lantern and it is not here to chat.",
  },
  {
    mood: "wraith",
    name: "Wraith",
    rule: "Past the deadline",
    text: "Red, glowing, parked next to your lantern. Each wraith costs you 16 to 24 points of sanity until you banish it.",
  },
] as const;

export function Landing({ onEnter }: Props) {
  const now = useNow(15_000);
  const tasks = useMemo(() => heroTasks(now), [now]);
  const placed = useMemo(() => placeGhosts(tasks, now), [tasks, now]);

  return (
    <div className="lp">
      <GhostDefs />
      <section className="lp-hero" aria-labelledby="lp-title">
        <nav className="lp-nav" aria-label="Site">
          <span className="lp-logo">Crypt Keeper</span>
          <a href="https://github.com/Fuuaad05/crypt-keeper" rel="noreferrer">
            Source on GitHub
          </a>
        </nav>

        <div className="lp-copy">
          <p className="lp-eyebrow">A deadline tracker for people who ignore to-do lists</p>
          <h1 id="lp-title">Every deadline is a ghost.</h1>
          <p className="lp-lede">
            Add an assignment and a ghost appears at the edge of the graveyard. Every hour it drifts closer to your
            lantern. Miss the due date and it turns into a wraith. Finish the work and it is gone.
          </p>
          <div className="lp-cta">
            <button type="button" className="btn primary big" onClick={() => onEnter(false)}>
              Open the crypt
            </button>
            <button type="button" className="lp-textlink" onClick={() => onEnter(true)}>
              or look around with sample ghosts
            </button>
          </div>
          <p className="lp-fine">Free. No account. Your ghosts stay in this browser.</p>
        </div>

        <div className="lp-scene" aria-label="Example graveyard with five ghosts at different distances from the lantern">
          <div className="moon" aria-hidden="true" />
          <svg className="rings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {[0.38, 0.62, 0.86].map((r, i) => (
              <ellipse key={r} cx="50" cy="86" rx={r * 44} ry={r * 74} className={`ring ring-${i}`} />
            ))}
          </svg>
          {tasks.map((t) => {
            const p = placed.get(t.id);
            if (!p) return null;
            const mood = moodOf(t, now);
            return (
              <div
                key={t.id}
                className={`ghost lp-ghost mood-${mood}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, ["--s" as string]: p.scale, ["--bob" as string]: `${t.createdAt * 0.5}s` }}
              >
                <GhostSvg color={courseColor(t.course)} mood={mood} />
                <span className="ghost-tag">
                  <strong>{t.title}</strong>
                  <em>{formatLeft(t.due, now)}</em>
                </span>
              </div>
            );
          })}
          <div className="lantern" style={{ ["--glow" as string]: 0.55 }} aria-hidden="true">
            <div className="lantern-aura" />
            <svg viewBox="0 0 60 90" width="54" height="81">
              <path d="M30 4v10" stroke="#8a6d3b" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 18h24l5 8H13z" fill="#6b4f2a" />
              <rect x="14" y="26" width="32" height="38" rx="4" fill="#ffd27a" opacity="0.28" stroke="#8a6d3b" strokeWidth="3" />
              <path className="flame" d="M30 32c6 7 8 13 0 26c-8-13-6-19 0-26z" fill="#ffb347" />
              <path className="flame-core" d="M30 42c3 4 3 8 0 14c-3-6-3-10 0-14z" fill="#fff3a8" />
              <path d="M13 66h34l-4 8H17z" fill="#6b4f2a" />
            </svg>
            <span className="lantern-name">you</span>
          </div>
        </div>
      </section>

      <section className="lp-guide" aria-labelledby="guide-title">
        <div className="lp-wrap">
          <h2 id="guide-title">How to read the graveyard</h2>
          <p className="lp-intro">
            Nothing in the scene is decoration. Every part of it is a number in disguise, and you will learn to read it
            in about ten seconds.
          </p>
          <ol className="lp-moods">
            {MOODS.map((m) => (
              <li key={m.mood}>
                <GhostSvg color="#efe8d8" mood={m.mood} size={64} />
                <div>
                  <h3>{m.name}</h3>
                  <p className="lp-rule">{m.rule}</p>
                  <p>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <dl className="lp-keys">
            <div>
              <dt>Distance</dt>
              <dd>The closer to your lantern, the closer the deadline.</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>How much you are dreading it. Big essays start haunting up to 15 days out. Small tasks, 7.</dd>
            </div>
            <div>
              <dt>Colour</dt>
              <dd>One colour per course, so you can tell the biology ghosts from the history ones.</dd>
            </div>
            <div>
              <dt>Lantern light</dt>
              <dd>Your sanity. It dims as wraiths pile up, and the whole graveyard turns red below 35.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="lp-rules" aria-labelledby="rules-title">
        <div className="lp-wrap lp-two">
          <h2 id="rules-title">What you do about it</h2>
          <div>
            <p>
              <b>Banish</b> a ghost by finishing the work. Click it, press the button, watch it dissolve. Misclicked? You
              get six seconds to undo.
            </p>
            <p>
              <b>Keep a streak.</b> Banish at least one ghost a day and the counter climbs. Ranks run from Restless
              Apprentice to Archlich of Deadlines.
            </p>
            <p>
              <b>Take it with you.</b> Export your deadlines as a calendar file, or as a JSON backup you can import
              again later.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-final">
        <div className="lp-wrap">
          <h2>The close ones are angry already.</h2>
          <button type="button" className="btn primary big" onClick={() => onEnter(false)}>
            Open the crypt
          </button>
        </div>
      </section>

      <footer className="lp-foot">
        <p>
          No account, no server. Everything is stored in this browser, and you can export it whenever you like.
        </p>
        <p>
          Built with Kiro for Kiroween 2026. MIT licensed.{" "}
          <a href="https://github.com/Fuuaad05/crypt-keeper" rel="noreferrer">
            Source
          </a>
        </p>
      </footer>
    </div>
  );
}
