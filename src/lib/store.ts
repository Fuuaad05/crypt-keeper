import { useEffect, useReducer } from "react";
import type { AppData, Settings, Task, TaskDraft } from "../types";
import { demoTasks, newId } from "./demo";
import { emptyData, loadData, saveData } from "./storage";

export type Action =
  | { type: "add"; draft: TaskDraft }
  | { type: "update"; id: string; draft: TaskDraft }
  | { type: "banish"; id: string; at: number }
  | { type: "revive"; id: string }
  | { type: "remove"; id: string }
  | { type: "demo"; now: number }
  | { type: "replace"; data: AppData }
  | { type: "reset" }
  | { type: "settings"; patch: Partial<Settings> };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "add": {
      const task: Task = { ...action.draft, id: newId(), createdAt: Date.now(), completedAt: null };
      return { ...state, tasks: [...state.tasks, task] };
    }
    case "update":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.draft } : t)),
      };
    case "banish":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, completedAt: action.at } : t)),
      };
    case "revive":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, completedAt: null } : t)),
      };
    case "remove":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "demo":
      return { ...state, tasks: [...state.tasks, ...demoTasks(action.now)] };
    case "replace":
      return action.data;
    case "reset":
      return { ...emptyData(), settings: state.settings };
    case "settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };
  }
}

export function useStore() {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  useEffect(() => {
    saveData(data);
  }, [data]);
  return [data, dispatch] as const;
}
