export type Effort = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  course: string;
  /** Due date as epoch milliseconds. */
  due: number;
  effort: Effort;
  notes: string;
  createdAt: number;
  /** Epoch milliseconds when the ghost was banished, or null while it still haunts. */
  completedAt: number | null;
}

export interface Settings {
  sound: boolean;
  ambient: boolean;
  notify: boolean;
}

export interface AppData {
  tasks: Task[];
  settings: Settings;
}

export type Mood = "calm" | "uneasy" | "angry" | "wraith";

export type View = "graveyard" | "ledger" | "tombstones";

export type TaskDraft = Omit<Task, "id" | "createdAt" | "completedAt">;
