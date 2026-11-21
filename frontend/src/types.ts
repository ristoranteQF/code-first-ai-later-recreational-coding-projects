export type Priority = "High" | "Medium" | "Low";
export type Filter = "All" | "Active" | "Done";
export type Screen = "Main" | "Trash";
 
export interface Todo {
  id: number;
  title: string;
  priority: Priority;
  completed: boolean;
  deleted: boolean;
}

export type State = {
  todos: Todo[];
  currentFilter: Filter;
  currentScreen: Screen;
  editingStateTasksIds: Set<number>;
}