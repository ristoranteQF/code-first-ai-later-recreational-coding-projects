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

export async function checkTodo(id: number, completed: boolean): Promise<Todo> {
  const todoEndpoint = BASE + `/${String(id)}`;
  console.log(todoEndpoint);
  const res = await fetch(todoEndpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if(!res.ok) throw new Error("Failed to tick todo, you heard?");
  return res.json();
}