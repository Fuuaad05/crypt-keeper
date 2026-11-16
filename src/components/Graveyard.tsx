import { useMemo } from "react";
import type { Task } from "../types";
import { courseColor, formatLeft, moodOf, placeGhosts } from "../lib/haunting";
import { GhostSvg } from "./Ghost";

interface Props {
  tasks: Task[];
  now: number;
  sanity: number;
  selectedId: string | null;
  banishingId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  onDemo: () => void;
}

const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 17.3) % 62,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.6,
}));

const TOMBS = [
  { left: 5, bottom: 4, scale: 1 },
  { left: 14, bottom: 9, scale: 0.8 },
  { left: 86, bottom: 5, scale: 1.1 },
  { left: 94, bottom: 10, scale: 0.75 },
  { left: 72, bottom: 2, scale: 0.85 },
  { left: 27, bottom: 2, scale: 0.7 },
];

export function Graveyard({ tasks, now, sanity, selectedId, banishingId, onSelect, onAdd, onDemo }: Props) {
  const active = useMemo(() => tasks.filter((t) => t.completedAt === null), [tasks]);
  const placements = useMemo(() => placeGhosts(active, now), [active, now]);
  const glow = 0.35 + (sanity / 100) * 0.65;
  const panic = sanity < 35;

  return (
    <section className={`scene ${panic ? "scene-panic" : ""}`} aria-label="The graveyard" onClick={() => onSelect(null)}>
      <div className="stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>
      <div className="moon" aria-hidden="true" />
      <div className="fog fog-a" aria-hidden="true" />
      <div className="fog fog-b" aria-hidden="true" />

      <svg className="rings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {[0.38, 0.62, 0.86].map((r, i) => (
          <ellipse key={r} cx="50" cy="86" rx={r * 44} ry={r * 74} className={`ring ring-${i}`} />
        ))}
      </svg>
      <span className="ring-label ring-label-0">haunting now</span>
      <span className="ring-label ring-label-1">closing in</span>
      <span className="ring-label ring-label-2">lurking</span>

      {TOMBS.map((t, i) => (
        <div
          key={i}
          className="tomb"
          aria-hidden="true"
          style={{ left: `${t.left}%`, bottom: `${t.bottom}%`, transform: `translateX(-50%) scale(${t.scale})` }}
        />
      ))}

      {active.map((task) => {
        const p = placements.get(task.id);
        if (!p) return null;
        const mood = moodOf(task, now);
        const color = courseColor(task.course);
        const banishing = banishingId === task.id;
        return (
          <button
            key={task.id}
            type="button"
            className={`ghost mood-${mood} ${selectedId === task.id ? "selected" : ""} ${banishing ? "banishing" : ""}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              ["--s" as string]: p.scale,
              ["--bob" as string]: `${(task.id.charCodeAt(0) % 5) * 0.4}s`,
              ["--c" as string]: color,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selectedId === task.id ? null : task.id);
            }}
            aria-label={`${task.title}, ${task.course}, ${formatLeft(task.due, now)}`}
          >
            <GhostSvg color={color} mood={mood} />
            <span className="ghost-tag">
              <strong>{task.title}</strong>
              <em>{formatLeft(task.due, now)}</em>
            </span>
          </button>
        );
      })}

      <div className="lantern" style={{ ["--glow" as string]: glow }} aria-hidden="true">
        <div className="lantern-aura" />
        <svg viewBox="0 0 60 90" width="54" height="81">
          <path d="M30 4v10" stroke="#8a6d3b" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 18h24l5 8H13z" fill="#6b4f2a" />
          <rect x="14" y="26" width="32" height="38" rx="4" fill="#ffd27a" opacity="0.28" stroke="#8a6d3b" strokeWidth="3" />
          <path className="flame" d="M30 32c6 7 8 13 0 26c-8-13-6-19 0-26z" fill="#ffb347" />
          <path className="flame-core" d="M30 42c3 4 3 8 0 14c-3-6-3-10 0-14z" fill="#fff3a8" />
          <path d="M13 66h34l-4 8H17z" fill="#6b4f2a" />
        </svg>
        <span className="lantern-name">the keeper</span>
      </div>

      {active.length === 0 && (
        <div className="empty" onClick={(e) => e.stopPropagation()}>
          <h2>The graveyard is silent</h2>
          <p>No ghosts haunt you. Add a deadline to summon one, or fill the crypt with sample ghosts to look around.</p>
          <div className="empty-actions">
            <button type="button" className="btn primary" onClick={onAdd}>
              Summon a ghost
            </button>
            <button type="button" className="btn" onClick={onDemo}>
              Add sample ghosts
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
