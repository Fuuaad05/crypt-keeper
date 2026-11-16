import type { Task } from "../types";
import { courseColor } from "../lib/haunting";

interface Props {
  tasks: Task[];
  onRevive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Tombstones({ tasks, onRevive, onDelete }: Props) {
  const done = tasks.filter((t) => t.completedAt !== null).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  if (done.length === 0) {
    return (
      <div className="panel center">
        <h2>No tombstones yet</h2>
        <p>Banish a ghost and it will rest here.</p>
      </div>
    );
  }
  return (
    <div className="tombs">
      {done.map((t) => {
        const late = t.completedAt !== null && t.completedAt > t.due;
        return (
          <article key={t.id} className="tombstone" style={{ ["--c" as string]: courseColor(t.course) }}>
            <div className="rip">R.I.P.</div>
            <h3>{t.title}</h3>
            <p className="course">{t.course}</p>
            <p className="dates">
              Banished {new Date(t.completedAt ?? 0).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {late ? " (after it turned)" : " (in time)"}
            </p>
            <div className="tomb-actions">
              <button type="button" className="btn small" onClick={() => onRevive(t.id)}>
                Revive
              </button>
              <button type="button" className="btn small danger" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.title}`}>
                ×
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
