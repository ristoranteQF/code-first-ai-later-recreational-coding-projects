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

export const clearCompleted = (): Todo[] => {
  todos.forEach(todo => {
    if(todo.completed === true){
      todo.deleted = true;
    }
  });

  console.log(todos);

  return todos;
}

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

export const deleteTodoPermanently = (id: number): void => {
  todos = todos.filter(todo => todo.id !== id);
  return;
};