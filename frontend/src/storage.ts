import type { State } from "./types.ts";
import { isFilter } from "./guards.ts";

const STORAGE_KEY = "todoAppState";

export function loadState(defaults: State): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;

    const saved = JSON.parse(raw);

    return {
      todos: Array.isArray(saved.todos) ? saved.todos : defaults.todos,
      currentFilter: isFilter(saved.currentFilter)
        ? saved.currentFilter
        : defaults.currentFilter,
      currentScreen: saved.currentScreen === "Trash" ? "Trash" : "Main",
      editingStateTasksIds: new Set<number>(
        Array.isArray(saved.editingStateTasksIds)
          ? saved.editingStateTasksIds
          : [],
      ),
    };
  } catch {
    return defaults;
  }
}

export function saveState(state: State): void {
  try {
    const serializable = {
      ...state,
      editingStateTasksIds: [...state.editingStateTasksIds],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}