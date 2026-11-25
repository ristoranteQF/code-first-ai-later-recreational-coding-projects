import type { Todo, Priority } from "./types.js";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if(!connectionString){
  throw new Error("DATABASE_URL is missing. Check your .env file and the dev script.");
}

const pool = new Pool({ connectionString });

export const getTodos = async (): Promise<Todo[]> => {
  const result = await pool.query<Todo>("SELECT * FROM todos ORDER BY id");
  return result.rows;
};

export const createTodo = (title: string, priority: Priority): Todo => {
  const todo: Todo = { id: nextId++, title, priority, completed: false, deleted: false };
  todos.push(todo);
  return todo;
};

export const updateTodo = (id: number, changes: Partial<Omit<Todo, "id">>): Todo | undefined => {
  const todo = todos.find(t => t.id === id);
  if (todo){
    Object.assign(todo, changes);
  }
  return todo;
};


export const recoverAll = (): Todo[] => {
  todos.forEach(todo => {
    if(todo.deleted === true){
      todo.deleted = false;
    }
  });

  return todos;
}

export const deleteAll = (): Todo[] => {
  todos = todos.filter(todo => !todo.deleted);
  return todos;
}


export const clearCompleted = (): Todo[] => {
  todos.forEach((todo) => {
    if (todo.completed) todo.deleted = true;
  });
  return todos;
};

export const deleteTodoPermanently = (id: number): boolean => {
  const before = todos.length;
  todos = todos.filter((todo) => todo.id !== id);
  return todos.length < before; // true if something was removed
};