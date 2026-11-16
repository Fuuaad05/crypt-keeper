import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Task, TaskDraft, View } from "./types";
import { useStore } from "./lib/store";
import { useNow } from "./lib/useNow";
import { DAY, courseColor, formatLeft, sanityOf } from "./lib/haunting";
import { playBanish, playSummon, playWarning, startAmbient, stopAmbient } from "./lib/audio";
import { GhostDefs } from "./components/Ghost";
import { Graveyard } from "./components/Graveyard";
import { Ledger } from "./components/Ledger";
import { Tombstones } from "./components/Tombstones";
import { DetailCard } from "./components/DetailCard";
import { TaskForm } from "./components/TaskForm";
import { Hud } from "./components/Hud";
import { Menu } from "./components/Menu";

interface Toast {
  message: string;
  undoId?: string;
}

const NOTIFIED_KEY = "crypt-keeper:notified";

function loadNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export default function App() {
  const [data, dispatch] = useStore();
  const now = useNow();
  const [view, setView] = useState<View>("graveyard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [banishingId, setBanishingId] = useState<string | null>(null);
  const [course, setCourse] = useState<string>("all");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const notified = useRef<Set<string>>(loadNotified());
  const seeded = useRef(false);

  const { tasks, settings } = data;

  const courses = useMemo(() => [...new Set(tasks.map((t) => t.course))].sort(), [tasks]);
  const activeCourse = course === "all" || courses.includes(course) ? course : "all";
  const visible = useMemo(
    () => (activeCourse === "all" ? tasks : tasks.filter((t) => t.course === activeCourse)),
    [tasks, activeCourse],
  );
  const sanity = sanityOf(tasks, now);
  const selected = tasks.find((t) => t.id === selectedId && t.completedAt === null) ?? null;

  const showToast = useCallback((message: string, undoId?: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, undoId });
    toastTimer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  const sfx = useCallback(
    (fn: () => void) => {
      if (settings.sound) fn();
    },
    [settings.sound],
  );

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  function saveTask(draft: TaskDraft) {
    if (editing) {
      dispatch({ type: "update", id: editing.id, draft });
      showToast("The ghost has been reshaped.");
    } else {
      dispatch({ type: "add", draft });
      sfx(playSummon);
      showToast("A new ghost rises.");
    }
    setFormOpen(false);
    setEditing(null);
  }

  function banish(id: string) {
    if (banishingId) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    sfx(playBanish);
    setBanishingId(id);
    window.setTimeout(() => {
      dispatch({ type: "banish", id, at: Date.now() });
      setBanishingId(null);
      setSelectedId(null);
      showToast(`Banished: ${task.title}`, id);
    }, 850);
  }

  function remove(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!window.confirm(`Delete "${task.title}" for good?`)) return;
    dispatch({ type: "remove", id });
    setSelectedId(null);
    showToast("Deleted.");
  }

  function demo() {
    dispatch({ type: "demo", now: Date.now() });
    sfx(playSummon);
    showToast("Sample ghosts added.");
  }

  // Opening the app with ?demo=1 fills an empty crypt with sample ghosts. Handy for demos and screenshots.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1" && data.tasks.length === 0 && !seeded.current) {
      seeded.current = true;
      dispatch({ type: "demo", now: Date.now() });
    }
    // Runs once on mount on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambient sound needs a user gesture before the browser lets it play.
  useEffect(() => {
    if (!settings.ambient) {
      stopAmbient();
      return;
    }
    const begin = () => startAmbient();
    window.addEventListener("pointerdown", begin, { once: true });
    startAmbient();
    return () => {
      window.removeEventListener("pointerdown", begin);
      stopAmbient();
    };
  }, [settings.ambient]);

  // Browser notifications for ghosts that are close or past due.
  useEffect(() => {
    if (!settings.notify || !("Notification" in window) || Notification.permission !== "granted") return;
    let changed = false;
    for (const t of tasks) {
      if (t.completedAt !== null) continue;
      const left = t.due - now;
      const stage = left <= 0 ? "over" : left <= DAY ? "day" : null;
      if (!stage) continue;
      const key = `${t.id}:${stage}`;
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      changed = true;
      new Notification(stage === "over" ? "A wraith has risen" : "A ghost is close", {
        body: `${t.title} (${t.course}): ${formatLeft(t.due, now)}`,
        icon: "/favicon.svg",
      });
      sfx(playWarning);
    }
    if (changed) {
      try {
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified.current]));
      } catch {
        // Ignore storage errors.
      }
    }
  }, [now, tasks, settings.notify, sfx]);

  // Press N to summon a ghost, unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openNew();
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNew]);

  return (
    <div className="app">
      <GhostDefs />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ☾
          </span>
          <div>
            <h1>Crypt Keeper</h1>
            <p>Every deadline is a ghost. Finish the work to banish it.</p>
          </div>
        </div>
        <div className="top-actions">
          <Menu
            data={data}
            onSettings={(patch) => dispatch({ type: "settings", patch })}
            onImport={(d) => dispatch({ type: "replace", data: d })}
            onDemo={demo}
            onReset={() => {
              dispatch({ type: "reset" });
              setSelectedId(null);
              showToast("The crypt is empty.");
            }}
            notify={(m) => showToast(m)}
          />
          <button type="button" className="btn primary" onClick={openNew}>
            Summon ghost <kbd>N</kbd>
          </button>
        </div>
      </header>

      <Hud tasks={tasks} now={now} />

      <nav className="toolbar" aria-label="Views and filters">
        <div className="tabs" role="tablist">
          {(
            [
              ["graveyard", "Graveyard"],
              ["ledger", "Ledger"],
              ["tombstones", "Tombstones"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              className={`tab ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="filters" aria-label="Filter by course">
          <button
            type="button"
            className={`chip ${activeCourse === "all" ? "on" : ""}`}
            onClick={() => setCourse("all")}
          >
            All crypts
          </button>
          {courses.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${activeCourse === c ? "on" : ""}`}
              style={{ ["--c" as string]: courseColor(c) }}
              onClick={() => setCourse(c)}
            >
              <i aria-hidden="true" />
              {c}
            </button>
          ))}
        </div>
      </nav>

      <main className="stage">
        {view === "graveyard" && (
          <>
            <Graveyard
              tasks={visible}
              now={now}
              sanity={sanity}
              selectedId={selected?.id ?? null}
              banishingId={banishingId}
              onSelect={setSelectedId}
              onAdd={openNew}
              onDemo={demo}
            />
            {selected && (
              <DetailCard
                task={selected}
                now={now}
                onBanish={() => banish(selected.id)}
                onEdit={() => {
                  setEditing(selected);
                  setFormOpen(true);
                }}
                onDelete={() => remove(selected.id)}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}
        {view === "ledger" && (
          <Ledger
            tasks={visible}
            now={now}
            onBanish={banish}
            onEdit={(t) => {
              setEditing(t);
              setFormOpen(true);
            }}
            onDelete={remove}
          />
        )}
        {view === "tombstones" && (
          <Tombstones
            tasks={visible}
            onRevive={(id) => {
              dispatch({ type: "revive", id });
              showToast("It lives again.");
            }}
            onDelete={remove}
          />
        )}
      </main>

      {formOpen && <TaskForm editing={editing} courses={courses} onSave={saveTask} onClose={closeForm} />}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.undoId && (
            <button
              type="button"
              className="link"
              onClick={() => {
                if (toast.undoId) dispatch({ type: "revive", id: toast.undoId });
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}

      <footer className="foot">
        Built for Kiroween 2026 with Kiro. Your data stays in this browser.
      </footer>
    </div>
  );
}
