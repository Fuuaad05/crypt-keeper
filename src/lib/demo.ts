import type { Task } from "../types";
import { DAY, HOUR } from "./haunting";

let counter = 0;

export function newId(): string {
  counter++;
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `${rand}-${counter}`;
}

/** A spread of deadlines that shows every mood at once. Useful for a first run and for demos. */
export function demoTasks(now: number): Task[] {
  const rows: Array<[string, string, number, 1 | 2 | 3 | 4 | 5, string]> = [
    ["Operating Systems lab report", "CS 301", -3 * HOUR, 4, "Scheduler comparison. Include the Gantt charts."],
    ["Calculus problem set 7", "MATH 202", 5 * HOUR, 3, "Sections 7.3 to 7.5."],
    ["Essay: The Gothic Novel", "ENG 210", 19 * HOUR, 5, "2,500 words, MLA."],
    ["Database ER diagram", "CS 340", 2 * DAY + 3 * HOUR, 2, ""],
    ["Physics quiz prep", "PHYS 101", 3 * DAY + 8 * HOUR, 3, "Chapters 9 and 10."],
    ["Group presentation slides", "BUS 150", 5 * DAY, 4, "Send the deck to the team by Thursday."],
    ["Statistics midterm", "STAT 220", 8 * DAY, 5, "Open notes. Bring a calculator."],
    ["Read chapter 12", "ENG 210", 6 * DAY + 4 * HOUR, 1, ""],
    ["Final project proposal", "CS 301", 12 * DAY, 4, "One page. Include a timeline."],
    ["Lab 4: circuits", "PHYS 101", 10 * DAY, 2, ""],
  ];
  return rows.map(([title, course, offset, effort, notes], i) => ({
    id: newId(),
    title,
    course,
    due: now + offset,
    effort,
    notes,
    createdAt: now - (rows.length - i) * 1000,
    completedAt: null,
  }));
}
