import { useEffect, useMemo, useRef, useState } from "react";
import type { Effort, Task, TaskDraft } from "../types";
import { DAY, courseColor } from "../lib/haunting";

interface Props {
  editing: Task | null;
  courses: string[];
  onSave: (draft: TaskDraft) => void;
  onClose: () => void;
}

/** Converts epoch ms to the value format that <input type="datetime-local"> expects. */
function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultDue(): number {
  const d = new Date(Date.now() + 3 * DAY);
  d.setHours(23, 59, 0, 0);
  return d.getTime();
}

const EFFORT_LABEL: Record<Effort, string> = {
  1: "A whisper",
  2: "Small spirit",
  3: "Restless soul",
  4: "Fearsome shade",
  5: "Ancient horror",
};

export function TaskForm({ editing, courses, onSave, onClose }: Props) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [course, setCourse] = useState(editing?.course ?? courses[0] ?? "");
  const [due, setDue] = useState(toLocalInput(editing?.due ?? defaultDue()));
  const [effort, setEffort] = useState<Effort>(editing?.effort ?? 3);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const preview = useMemo(() => courseColor(course || "General"), [course]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Every ghost needs a name.");
      return;
    }
    const dueMs = new Date(due).getTime();
    if (!Number.isFinite(dueMs)) {
      setError("Pick a valid due date.");
      return;
    }
    onSave({ title: trimmed, course: course.trim() || "General", due: dueMs, effort, notes: notes.trim() });
  }

  function quickDue(offsetDays: number, hour: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    setDue(toLocalInput(d.getTime()));
  }

  return (
    <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="form-title">
        <h2 id="form-title">{editing ? "Reshape the ghost" : "Summon a ghost"}</h2>

        <label>
          <span>Name of the deadline</span>
          <input
            ref={titleRef}
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Operating Systems lab report"
          />
        </label>

        <div className="row">
          <label>
            <span>Course or crypt</span>
            <input
              value={course}
              maxLength={40}
              list="course-list"
              onChange={(e) => setCourse(e.target.value)}
              placeholder="CS 301"
            />
            <datalist id="course-list">
              {courses.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <div className="swatch" style={{ background: preview }} title="Ghost colour for this course" />
        </div>

        <label>
          <span>Due</span>
          <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
        <div className="chips" aria-label="Quick due dates">
          <button type="button" className="chip" onClick={() => quickDue(0, 23)}>
            Tonight
          </button>
          <button type="button" className="chip" onClick={() => quickDue(1, 12)}>
            Tomorrow noon
          </button>
          <button type="button" className="chip" onClick={() => quickDue(3, 23)}>
            In 3 days
          </button>
          <button type="button" className="chip" onClick={() => quickDue(7, 23)}>
            Next week
          </button>
        </div>

        <label>
          <span>
            Dread level: <b>{EFFORT_LABEL[effort]}</b>
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={effort}
            onChange={(e) => setEffort(Number(e.target.value) as Effort)}
          />
          <small>Bigger ghosts start haunting you earlier.</small>
        </label>

        <label>
          <span>Notes</span>
          <textarea
            value={notes}
            maxLength={1000}
            rows={3}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the ghost should remind you of"
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            {editing ? "Save changes" : "Summon"}
          </button>
        </div>
      </form>
    </div>
  );
}
