export function getElement<T extends Element>(
  selector: string,
  root: ParentNode = document,
): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function getElements<T extends Element>(
  selector: string,
  root: ParentNode = document,
): NodeListOf<T> {
  const els = root.querySelectorAll<T>(selector);
  if (els.length === 0) throw new Error(`No elements found: ${selector}`);
  return els;
}

export function getTaskId(target: Element): number | undefined {
  const group = target.closest<HTMLElement>("[data-id]");
  if(!group) return;

  const id = Number(group.dataset.id);
  return id;
}





// DOM elements
export const currentDate = getElement<HTMLElement>(".current-date");
export const inputTextField = getElement<HTMLInputElement>(".input-text");
export const formContainer = getElement<HTMLFormElement>(".form-container");
export const trashBinContainer = getElement<HTMLDivElement>(".trash-bin-screen-container");
export const emptyTrashBinComponent = getElement<HTMLDivElement>(".empty-trash-bin-body-container");
export const trashBinBodyContainer = getElement<HTMLDivElement>(".trash-bin-container-body");

export const addTaskButton = getElement<HTMLButtonElement>(".add-todo-btn");
export const clearCompletedTasksBtn = getElement<HTMLButtonElement>(".clear-completed-tasks-btn");
export const tasksStatusButtons = getElements<HTMLButtonElement>("button.tasks-status-btn");
export const trashBinButton = getElement<HTMLButtonElement>(".trash-bin-button");
export const quitTrashBinButton = getElement<HTMLButtonElement>(".return-to-tasks-button");
export const recoverAllTasksButton = getElement<HTMLButtonElement>(".recover-all-tasks-button");
export const deleteAllTasksButton = getElement<HTMLButtonElement>(".delete-all-tasks-button");

export const allTasksCountSpan = getElement<HTMLSpanElement>(".all-tasks-count");
export const activeTasksCountSpan = getElement<HTMLSpanElement>(".active-tasks-count");
export const doneTasksCountSpan = getElement<HTMLSpanElement>(".done-tasks-count");
export const taskCount = getElement<HTMLSpanElement>(".task-count");
export const priorityElement = getElement<HTMLSelectElement>("#priority");
export const todoContainer = getElement<HTMLDivElement>(".todo-container");
export const noTasksContainer = getElement<HTMLDivElement>(".no-tasks-container");

export const deleteAllDialog = getElement<HTMLDialogElement>(".confirm");
export const cancelDeleteAllDialog = getElement<HTMLButtonElement>("#confirmCancel");
export const confirmDeleteAllButton = getElement<HTMLButtonElement>("#confirmDelete");
export const confirmCount = getElement<HTMLSpanElement>("#confirmCount");

export const deleteTaskDialog = getElement<HTMLDialogElement>(".confirmDeleteTask");
export const cancelDeleteTaskButton = getElement<HTMLButtonElement>(".cancel", deleteTaskDialog);
export const confirmDeleteTaskButton = getElement<HTMLButtonElement>(".confirm-delete", deleteTaskDialog);

