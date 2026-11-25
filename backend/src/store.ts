import pg from "pg";
import type { Todo, Priority } from "./types.js";
import type { TodoChanges } from "./guards.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your .env file and the dev script.");
}

const pool = new Pool({ connectionString });

export const getTodos = async (): Promise<Todo[]> => {
  const result = await pool.query<Todo>("SELECT * FROM todos ORDER BY id");
  return result.rows;
};

export const createTodo = async (title: string, priority: Priority): Promise<Todo> => {
  const result = await pool.query<Todo>(
    "INSERT INTO todos (title, priority) VALUES ($1, $2) RETURNING *",
    [title, priority],
  );
  const row = result.rows[0];
  if (!row) throw new Error("INSERT returned no row");
  return row;
};


const UPDATABLE = ["title", "priority", "completed", "deleted"] as const;

export const updateTodo = async (id: number, changes: TodoChanges): Promise<Todo | undefined> => {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const column of UPDATABLE) {
    const value = changes[column];
    if (value !== undefined) {
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    }
  }
  if (sets.length === 0) throw new Error("updateTodo called with no changes");

  values.push(id);
  const result = await pool.query<Todo>(
    `UPDATE todos SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return result.rows[0];
};

export const deleteTodoPermanently = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const clearCompleted = async (): Promise<Todo[]> => {
  await pool.query("UPDATE todos SET deleted = true WHERE completed = true AND deleted = false");
  return getTodos();
};

export const recoverAll = async (): Promise<Todo[]> => {
  await pool.query("UPDATE todos SET deleted = false WHERE deleted = true");
  return getTodos();
};

export const deleteAll = async (): Promise<Todo[]> => {
  await pool.query("DELETE FROM todos WHERE deleted = true");
  return getTodos();
};