export type Priority = "High" | "Medium" | "Low";

export interface Todo {
  id: number;
  title: string;
  priority: Priority;
  completed: boolean;
  deleted: boolean;
}