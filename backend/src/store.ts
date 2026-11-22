import type { Todo, Priority } from "./types.js";

export let todos: Todo[] = [];
let nextId = 1;


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