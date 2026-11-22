import type { Priority, Todo } from "./types.js";

export type TodoChanges = Partial<Omit<Todo, "id">>;

export const isPriority = (v: unknown): v is Priority =>
  v === "High" || v === "Medium" || v === "Low";

// returns only the allowed, valid fields, or null if anything is wrong
export function parseChanges(body: unknown): TodoChanges | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const changes: TodoChanges = {};

  if ("title" in b) {
    if (typeof b.title !== "string" || b.title.trim() === "") return null;
    changes.title = b.title.trim();
  }
  if ("priority" in b) {
    if (!isPriority(b.priority)) return null;
    changes.priority = b.priority;
  }
  if ("completed" in b) {
    if (typeof b.completed !== "boolean") return null;
    changes.completed = b.completed;
  }
  if ("deleted" in b) {
    if (typeof b.deleted !== "boolean") return null;
    changes.deleted = b.deleted;
  }

  return Object.keys(changes).length === 0 ? null : changes;
}