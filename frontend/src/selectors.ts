import type { Todo, Filter } from "./types";


export function filterTodos(todos: Todo[], currentFilter: Filter){
  const filteredTodos = todos.filter(todo => {
    if(todo.deleted) return false;

    if(currentFilter === "Active") return !todo.completed;
    if(currentFilter === "Done") return todo.completed;

    // if it's all, keep the todo
    return true;
  });

  return filteredTodos;
}