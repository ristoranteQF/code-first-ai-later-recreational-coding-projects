import type { State, Priority } from "./types.ts";
import { loadState, saveState } from "./storage.ts";
import * as api from "./api.ts";

const defaultState: State = {
  todos: [],
  currentFilter: "All",
  currentScreen: "Main",
  editingStateTasksIds: new Set<number>(),
};

export const state: State = loadState(defaultState);

export async function loadTodos(): Promise<void> {
  state.todos = await api.fetchTodos();
}

export async function addTodo(title: string, priority: Priority): Promise<void> {
  const created = await api.createTodo(title, priority);
  state.todos.push(created);
}



export function editTask(id: number, title: string) {
  const task = state.todos.find((t) => t.id === id);
  if (task) task.title = title;
  saveState(state);
}

export function deleteTask(id: number): void {
  const task = state.todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = true;
  saveState(state);
}

export function restoreTask(id: number): void {
  const task = state.todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = false;
  saveState(state);
}

export function restoreAllTasks() {
  state.todos.forEach((todo) => {
    if (todo.deleted) todo.deleted = false;
  });
  saveState(state);
}

export function deletePermanently(id: number): void {
  state.todos = state.todos.filter((t) => t.id !== id);
  saveState(state);
}

export function emptyTrash(): void {
  state.todos = state.todos.filter((t) => !t.deleted);
  saveState(state);
}