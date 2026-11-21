import type { Todo, Priority } from "./types.js";

export let todos: Todo[] = [];
let nextId = 1;


export const createTodo = (title: string, priority: Priority): Todo => {
  const todo: Todo = { id: nextId++, title, priority, completed: false, deleted: false };
  todos.push(todo);
  return todo;
};

export const checkTodo = (id: number, completed: boolean): Todo => {
  const todo: Todo = todos.find(todo => todo.id === id);
  if(!todo) throw new Error(`Todo with id ${id} does not exist.`);
  todo.completed = completed;
  return todo;
}