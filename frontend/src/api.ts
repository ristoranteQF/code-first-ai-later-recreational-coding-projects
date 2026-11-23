import type { Todo, Priority } from "./types.ts";

const BASE = "http://localhost:3000/todos";

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to load todos");
  return res.json();
}

export async function createTodo(title: string, priority: Priority): Promise<Todo> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(
  id: number,
  changes: Partial<Omit<Todo, "id">>,
): Promise<Todo> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: number): Promise<void>{
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    body: JSON.stringify({id}),
  });
  if(!res.ok) throw new Error("Failed to delete todo.");
  return;
}

export async function clearCompleted(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/clear-completed`, {
    method: "POST",
  });

  if(!res.ok) throw new Error("Failed to clear completed todos.");

  return res.json();
}

export async function deleteAll(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/delete-all`, {
    method: "DELETE",
  });
  if(!res.ok) throw new Error("Failed to empty trash bin.");

  return res.json();
}

export async function recoverAll(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/recover-all`, {
    method: "POST",
  });
  if(!res.ok) throw new Error("Failed to recover tasks.");

  return res.json();
}