import type { Effort, Mood, Task } from "../types";

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Harder tasks start haunting earlier: 7 days for effort 1, 15 days for effort 5. */
export function horizonFor(effort: Effort): number {
  return (5 + effort * 2) * DAY;
}

/** 0 means the ghost is far away, 1 means it is due now or overdue. */
export function urgency(task: Task, now: number): number {
  const left = task.due - now;
  if (left <= 0) return 1;
  return clamp(1 - left / horizonFor(task.effort), 0, 1);
}

export function moodOf(task: Task, now: number): Mood {
  const left = task.due - now;
  if (left <= 0) return "wraith";
  if (left <= DAY) return "angry";
  if (urgency(task, now) > 0.5) return "uneasy";
  return "calm";
}

export function isOverdue(task: Task, now: number): boolean {
  return task.completedAt === null && task.due <= now;
}

/** Sanity runs from 0 to 100. Wraiths and ghosts due within a day drain it. */
export function sanityOf(tasks: Task[], now: number): number {
  let drain = 0;
  for (const t of tasks) {
    if (t.completedAt !== null) continue;
    const left = t.due - now;
    if (left <= 0) drain += 14 + t.effort * 2;
    else if (left <= DAY) drain += 4 + t.effort;
    else if (left <= 3 * DAY) drain += 1 + Math.floor(t.effort / 2);
  }
  return clamp(100 - drain, 0, 100);
}

export function formatLeft(due: number, now: number): string {
  const diff = due - now;
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / HOUR);
  const days = Math.floor(abs / DAY);
  let text: string;
  if (mins < 1) text = "moments";
  else if (mins < 60) text = `${mins}m`;
  else if (hours < 24) text = `${hours}h ${mins % 60}m`;
  else text = `${days}d ${hours % 24}h`;
  if (mins < 1) return diff >= 0 ? "due this instant" : "just overdue";
  return diff >= 0 ? `${text} left` : `${text} overdue`;
}

export function formatDue(due: number): string {
  return new Date(due).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const RANKS = [
  { min: 0, title: "Restless Apprentice" },
  { min: 3, title: "Grave Sweeper" },
  { min: 8, title: "Candle Bearer" },
  { min: 15, title: "Spirit Warden" },
  { min: 30, title: "Crypt Keeper" },
  { min: 60, title: "Archlich of Deadlines" },
] as const;

export function rankFor(banished: number) {
  let current: (typeof RANKS)[number] = RANKS[0];
  let next: (typeof RANKS)[number] | null = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (banished >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  return { title: current.title, next, progress: next ? (banished - current.min) / (next.min - current.min) : 1 };
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days, ending today or yesterday, on which at least one ghost was banished. */
export function streakOf(tasks: Task[], now: number): number {
  const days = new Set<string>();
  for (const t of tasks) if (t.completedAt !== null) days.add(dayKey(t.completedAt));
  let cursor = now;
  if (!days.has(dayKey(cursor))) cursor -= DAY;
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor -= DAY;
  }
  return count;
}

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const COURSE_COLORS = ["#c9b8ff", "#8be9d0", "#ffb86b", "#ff8fab", "#8bc5ff", "#d7f58b", "#f0a6ff", "#ffe08a"];

export function courseColor(course: string): string {
  return COURSE_COLORS[hash(course.trim().toLowerCase()) % COURSE_COLORS.length];
}

export interface GhostPlacement {
  /** Percent from the left of the scene. */
  x: number;
  /** Percent from the top of the scene. */
  y: number;
  scale: number;
}

/**
 * Places active tasks on a half-circle around the lantern.
 * Closer to the lantern means closer to the deadline. Angles are spread evenly so ghosts rarely overlap.
 */
export function placeGhosts(active: Task[], now: number): Map<string, GhostPlacement> {
  // Ordering by id hash scatters urgent and relaxed ghosts around the whole arc instead of in one corner.
  const ordered = [...active].sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
  const n = ordered.length;
  const result = new Map<string, GhostPlacement>();
  const crowd = n > 18 ? 0.6 : n > 12 ? 0.75 : n > 7 ? 0.9 : 1;
  let overdueIndex = 0;
  ordered.forEach((task, i) => {
    const jitter = ((hash(task.id) % 100) / 100 - 0.5) * 0.35;
    const theta = (14 + ((i + 0.5 + jitter) / n) * 152) * (Math.PI / 180);
    let r: number;
    if (task.due <= now) {
      r = 0.2 + 0.07 * (overdueIndex % 3);
      overdueIndex++;
    } else {
      r = 1 - 0.8 * urgency(task, now);
      r = Math.max(r, 0.3);
    }
    const x = 50 + Math.cos(theta) * r * 44;
    const y = 86 - Math.sin(theta) * r * 74;
    const scale = (0.78 + task.effort * 0.08) * crowd;
    result.set(task.id, { x, y, scale });
  });
  return result;
}
