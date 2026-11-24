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