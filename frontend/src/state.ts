import type { Todo, State, Priority } from "./types.ts";
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
  if(!created) return;
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
  const todo = state.todos.find((t) => t.id === id);
  if (!todo) throw new Error(`Todo ${id} not found in local state`);

  await api.deleteTodo(id);
  state.todos = state.todos.filter(todo => todo.id !== id);
}

export async function handleClearCompleted(): Promise<void> {
  const completedTodos = await api.clearCompleted();
  if(!completedTodos) return;

  state.todos = [...completedTodos];
}

export async function handleRecoverAll(): Promise<void> {
  let countsoftDeletedTodos = 0;
  state.todos.forEach(todo => {
    if(todo.deleted === true){
      countsoftDeletedTodos++;
    }
  });

  if(!countsoftDeletedTodos) return;

  const recovered = await api.recoverAll();
  if(!recovered) return;

  state.todos = [...recovered.recovered];
}

export async function handleDeleteAll(): Promise<void> {
  const currentTasks = await api.deleteAll();
  if(!currentTasks) return;

  state.todos = [...currentTasks.deleted];
}