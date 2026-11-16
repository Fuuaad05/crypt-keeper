import type { Task } from "../types";
import { courseColor, formatDue, formatLeft, moodOf } from "../lib/haunting";
import { GhostSvg } from "./Ghost";

interface Props {
  task: Task;
  now: number;
  onBanish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const MOOD_TEXT = {
  calm: "Sleeping. For now.",
  uneasy: "Stirring. It senses you.",
  angry: "Furious. Less than a day left.",
  wraith: "A wraith. It is past due and feeding on your sanity.",
} as const;

export function DetailCard({ task, now, onBanish, onEdit, onDelete, onClose }: Props) {
  const mood = moodOf(task, now);
  const color = courseColor(task.course);
  return (
    <aside className={`detail mood-${mood}`} aria-label="Ghost details" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="icon-btn close" onClick={onClose} aria-label="Close details">
        ×
      </button>
      <div className="detail-head">
        <GhostSvg color={color} mood={mood} size={52} />
        <div>
          <h3>{task.title}</h3>
          <p className="course" style={{ color }}>
            {task.course}
          </p>
        </div>
      </div>
      <p className="mood-line">{MOOD_TEXT[mood]}</p>
      <dl>
        <dt>Due</dt>
        <dd>{formatDue(task.due)}</dd>
        <dt>Time</dt>
        <dd className={mood === "wraith" ? "danger" : ""}>{formatLeft(task.due, now)}</dd>
        <dt>Dread</dt>
        <dd>{"●".repeat(task.effort)}{"○".repeat(5 - task.effort)}</dd>
      </dl>
      {task.notes && <p className="notes">{task.notes}</p>}
      <div className="detail-actions">
        <button type="button" className="btn primary wide" onClick={onBanish}>
          Banish this ghost
        </button>
        <button type="button" className="btn" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="btn danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </aside>
  );
}
