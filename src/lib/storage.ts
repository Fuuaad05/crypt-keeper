import type { AppData, Effort, Settings, Task } from "../types";

const KEY = "crypt-keeper:v1";

export const DEFAULT_SETTINGS: Settings = { sound: true, ambient: false, notify: false };

export function emptyData(): AppData {
  return { tasks: [], settings: { ...DEFAULT_SETTINGS } };
}

function isEffort(n: unknown): n is Effort {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

function sanitizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string" || typeof t.title !== "string" || typeof t.due !== "number") return null;
  if (!Number.isFinite(t.due)) return null;
  return {
    id: t.id,
    title: t.title.slice(0, 120),
    course: typeof t.course === "string" ? t.course.slice(0, 40) : "General",
    due: t.due,
    effort: isEffort(t.effort) ? t.effort : 3,
    notes: typeof t.notes === "string" ? t.notes.slice(0, 1000) : "",
    createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
    completedAt: typeof t.completedAt === "number" ? t.completedAt : null,
  };
}

/** Accepts untrusted JSON (localStorage or an imported file) and returns safe app data. */
export function parseData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.tasks)) return null;
  const tasks = obj.tasks.map(sanitizeTask).filter((t): t is Task => t !== null);
  const s = (obj.settings ?? {}) as Record<string, unknown>;
  const settings: Settings = {
    sound: typeof s.sound === "boolean" ? s.sound : DEFAULT_SETTINGS.sound,
    ambient: typeof s.ambient === "boolean" ? s.ambient : DEFAULT_SETTINGS.ambient,
    notify: typeof s.notify === "boolean" ? s.notify : DEFAULT_SETTINGS.notify,
  };
  return { tasks, settings };
}

export function loadData(): AppData {
  try {
    const text = localStorage.getItem(KEY);
    if (!text) return emptyData();
    return parseData(JSON.parse(text)) ?? emptyData();
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage can be full or blocked. The app keeps working in memory.
  }
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function icsDate(ts: number): string {
  return new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function buildIcs(tasks: Task[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Crypt Keeper//EN"];
  for (const t of tasks) {
    if (t.completedAt !== null) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${t.id}@crypt-keeper`,
      `DTSTAMP:${icsDate(Date.now())}`,
      `DTSTART:${icsDate(t.due)}`,
      `DTEND:${icsDate(t.due + 30 * 60_000)}`,
      `SUMMARY:${icsEscape(`${t.course}: ${t.title}`)}`,
      `DESCRIPTION:${icsEscape(t.notes)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT24H",
      "ACTION:DISPLAY",
      "DESCRIPTION:A ghost approaches",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
