import type { Todo, State, Priority } from "./types.ts";
import { loadState } from "./storage.ts";
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

export async function modifyStateTodo(
  id: number,
  changes: Partial<Omit<Todo, "id">>,
): Promise<void> {
  const todo = state.todos.find((t) => t.id === id);
  if (!todo) throw new Error(`Todo ${id} not found in local state`);

  const updated = await api.updateTodo(id, changes);
  Object.assign(todo, updated);
}

export async function deleteTodoPermanently(id: number): Promise<void> {
  await api.deleteTodo(id);
  state.todos = state.todos.filter((t) => t.id !== id);
}

export async function handleClearCompleted(): Promise<void> {
  state.todos = await api.clearCompleted();
}

export async function handleRecoverAll(): Promise<void> {
  if (!state.todos.some((t) => t.deleted)) return;
  state.todos = await api.recoverAll();
}

export async function handleDeleteAll(): Promise<void> {
  state.todos = await api.deleteAll();
}