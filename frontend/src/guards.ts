import type { Priority, Filter } from "./types";


export function isPriority(value: unknown): value is Priority {
  return value === "High" || value === "Medium" || value === "Low";
}

export function isFilter(value: unknown): value is Filter {
  return value === "All" || value === "Active" || value === "Done";
}