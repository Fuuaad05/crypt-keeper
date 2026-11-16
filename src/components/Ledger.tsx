import type { Task } from "../types";
import { DAY, courseColor, formatDue, formatLeft, moodOf } from "../lib/haunting";

interface Props {
  tasks: Task[];
  now: number;
  onBanish: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const GROUPS = [
  { key: "wraiths", title: "Wraiths: overdue", test: (left: number) => left <= 0 },
  { key: "today", title: "Haunting today", test: (left: number) => left > 0 && left <= DAY },
  { key: "week", title: "This week", test: (left: number) => left > DAY && left <= 7 * DAY },
  { key: "later", title: "Lurking later", test: (left: number) => left > 7 * DAY },
] as const;

export function Ledger({ tasks, now, onBanish, onEdit, onDelete }: Props) {
  const active = tasks.filter((t) => t.completedAt === null).sort((a, b) => a.due - b.due);
  if (active.length === 0) {
    return (
      <div className="panel center">
        <h2>Nothing haunts the ledger</h2>
        <p>Every ghost is banished. Enjoy the quiet.</p>
      </div>
    );
  }
  return (
    <div className="ledger">
      {GROUPS.map((g) => {
        const items = active.filter((t) => g.test(t.due - now));
        if (items.length === 0) return null;
        return (
          <section key={g.key} className="panel">
            <h2 className={g.key === "wraiths" ? "danger" : ""}>
              {g.title} <span className="count">{items.length}</span>
            </h2>
            <ul>
              {items.map((t) => (
                <li key={t.id} className={`row-item mood-${moodOf(t, now)}`}>
                  <span className="dot" style={{ background: courseColor(t.course) }} aria-hidden="true" />
                  <div className="grow">
                    <strong>{t.title}</strong>
                    <small>
                      {t.course} · {formatDue(t.due)}
                    </small>
                  </div>
                  <span className="when">{formatLeft(t.due, now)}</span>
                  <button type="button" className="btn small primary" onClick={() => onBanish(t.id)}>
                    Banish
                  </button>
                  <button type="button" className="btn small" onClick={() => onEdit(t)} aria-label={`Edit ${t.title}`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={() => onDelete(t.id)}
                    aria-label={`Delete ${t.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
