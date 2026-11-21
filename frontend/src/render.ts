import type { Todo } from "./types.ts"
import { state } from "./state.ts";
import { isFilter } from "./guards.ts";
import { filterTodos } from "./selectors.ts";
import {
  taskCount, allTasksCountSpan, activeTasksCountSpan, doneTasksCountSpan,
  noTasksContainer, todoContainer, trashBinBodyContainer, emptyTrashBinComponent,
  formContainer, trashBinContainer, tasksStatusButtons,
} from "./dom.ts";



export function renderUIData() {
  const activeTasks = state.todos.filter((todo) => {
    return !todo.completed && !todo.deleted;
  }).length;

  const tasksCount: number = activeTasks;

  if (tasksCount !== 1) {
    if (taskCount) {
      taskCount.textContent = `${String(tasksCount)} tasks left.`;
    } else {
      console.error("Unknown error has occurred with the .task-count class");
    }
  } else {
    if (taskCount) {
      taskCount.textContent = `${String(tasksCount)} task left.`;
    } else {
      console.error("Unknown error has occurred with the .task-count class");
    }
  }

  const allTasksCount = state.todos.filter((todo) => !todo.deleted).length;
  const activeTasksCount = state.todos.filter(
    (todo) => !todo.completed && !todo.deleted,
  ).length;
  const completedTasksCount = state.todos.filter(
    (todo) => todo.completed && !todo.deleted,
  ).length;

  if (allTasksCountSpan) allTasksCountSpan.textContent = String(allTasksCount);
  if (activeTasksCountSpan)
    activeTasksCountSpan.textContent = String(activeTasksCount);
  if (doneTasksCountSpan)
    doneTasksCountSpan.textContent = String(completedTasksCount);
}
// render the data based on which filter category is present
export function renderTasks() {
  syncFilterButtonsState();

  // get only the todos we need
  const filteredTodos = filterTodos(state.todos, state.currentFilter);

  // handle the empty state container
  if (filteredTodos.length === 0) {
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  // loop through the filtered list, build each element and append it.
  filteredTodos.forEach(todo => {
  const taskGroup = state.editingStateTasksIds.has(todo.id)
    ? createEditTaskElement(todo)
    : createTaskElement(todo);

  todoContainer?.appendChild(taskGroup);
});
}

export function renderDeletedTasks() {
  trashBinBodyContainer
    ?.querySelectorAll(".deleted-task-group")
    .forEach((el) => el.remove());

  const countDeleted = state.todos.filter((todo) => todo.deleted).length;

  if (countDeleted === 0) {
    emptyTrashBinComponent?.classList.remove("hide-element");
  } else {
    emptyTrashBinComponent?.classList.add("hide-element");
  }

  for (const todo of state.todos) {
    if (!todo.deleted) continue;

    const deletedTaskGroup = deleteTaskElement(todo);
    trashBinBodyContainer?.appendChild(deletedTaskGroup);
  }
}

export function render() {
  syncScreenState();

  if (state.currentScreen === "Main") {
    renderTasks();
    renderUIData();
  } else {
    renderDeletedTasks();
  }
}

export function syncFilterButtonsState() {
  tasksStatusButtons.forEach(button => {
    const buttonFilter = button.dataset.filter;

    if (!isFilter(buttonFilter)) {
      console.error("Filter button has a missing or invalid data-filter:", button);
      button.classList.remove("active-status-style");
      return;
    }

    button.classList.toggle("active-status-style", buttonFilter === state.currentFilter);
  });
}

export function syncScreenState() {
  formContainer?.classList.toggle("hide-element", state.currentScreen !== "Main");
  trashBinContainer?.classList.toggle("hide-element", state.currentScreen !== "Trash");
}



// DOM builder functions
export function createTaskElement(todo: Todo) {
    const taskGroup = document.createElement("div");
    taskGroup.classList.add("task-group");
    taskGroup.dataset.id = String(todo.id);

    const taskLeftGroup = document.createElement("div");
    taskLeftGroup.classList.add("task-left-group");
    const taskRightGroup = document.createElement("div");
    taskRightGroup.classList.add("task-right-group");

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.name = "task";
    taskCheckbox.id = `task-checkbox-${todo.id}`;
    taskCheckbox.checked = todo.completed;
    const taskLabel = document.createElement("label");
    taskLabel.htmlFor = `task-checkbox-${todo.id}`;
    taskLabel.textContent = `${todo.title}`;
    taskLabel.classList.add("input-label");
    if (todo.completed) {
      taskLabel.classList.add("completed-task");
    }

    taskLeftGroup.append(taskCheckbox, taskLabel);

    const taskRightGroupContainer = document.createElement("div");
    taskRightGroupContainer.classList.add("task-right-group-container");
    const priorityElement = document.createElement("span");
    priorityElement.classList.add("priority-element");
    const priorityElementType = todo.priority.toLowerCase();
    priorityElement.classList.add(
      `priority-element-${priorityElementType}-styles`,
    );
    priorityElement.textContent = todo.priority;
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("edit-btn");
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-edit");
    editButton.appendChild(editIcon);
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-btn");
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash-can");
    deleteButton.appendChild(deleteIcon);
    taskRightGroupContainer.append(priorityElement, editButton, deleteButton);

    taskRightGroup.append(taskRightGroupContainer);
    taskGroup.append(taskLeftGroup, taskRightGroup);

    return taskGroup;
}
export function deleteTaskElement(todo: Todo){
  const deletedTaskGroup = document.createElement("div");
  deletedTaskGroup.classList.add("deleted-task-group");
  // deletedTaskGroup.id = `task-${todo.id}`;
  deletedTaskGroup.dataset.id = String(todo.id);

  const deletedTaskLeftGroup = document.createElement("div");
  deletedTaskLeftGroup.classList.add("deleted-task-left-group");
  const deletedInputLabel = document.createElement("label");
  deletedInputLabel.classList.add("deleted-input-label");
  deletedInputLabel.textContent = `${todo.title}`;
  deletedTaskLeftGroup.appendChild(deletedInputLabel)
  const deletedTaskRightGroup = document.createElement("div");
  deletedTaskRightGroup.classList.add("deleted-task-right-group");
  const recoverTaskButton = document.createElement("button");
  recoverTaskButton.classList.add("recover-task-button");
  recoverTaskButton.type = "button";
  recoverTaskButton.textContent = "Recover";
  const leftArrowIcon = document.createElement("i");
  leftArrowIcon.classList.add("fa", "fa-arrow-left-rotate");
  recoverTaskButton.appendChild(leftArrowIcon);
  const deleteTaskButton = document.createElement("button");
  deleteTaskButton.classList.add("delete-task-button");
  deleteTaskButton.type = "button";
  deleteTaskButton.textContent = "Delete";
  const warningIcon = document.createElement("i");
  warningIcon.classList.add("fa", "fa-warning");
  deleteTaskButton.prepend(warningIcon);
  deletedTaskRightGroup.append(recoverTaskButton, deleteTaskButton)
  deletedTaskGroup.append(deletedTaskLeftGroup, deletedTaskRightGroup);

  return deletedTaskGroup;
}
export function createEditTaskElement(todo: Todo){
  const taskGroup = document.createElement("div");
  taskGroup.classList.add("task-group", "task-group-editing");
  taskGroup.dataset.id = String(todo.id);

  const taskLeftGroup = document.createElement("div");
  taskLeftGroup.classList.add("task-left-group");
  const editInput = document.createElement("input");
  editInput.classList.add("edit-input");
  editInput.value = `${todo.title}`;
  taskLeftGroup.append(editInput);

  const taskRightGroup = document.createElement("div");
  taskRightGroup.classList.add("task-right-group");
  const taskRightGroupEditContainer = document.createElement("div");
  taskRightGroupEditContainer.classList.add("task-right-group-edit-container");
  const editSaveButton = document.createElement("button");
  editSaveButton.classList.add("edit-save-btn");
  editSaveButton.type = "button";
  editSaveButton.textContent = "Save";
  const editCancelButton = document.createElement("button");
  editCancelButton.classList.add("edit-cancel-btn");
  editCancelButton.type = "button";
  editCancelButton.textContent = "Cancel";
  taskRightGroupEditContainer.append(editSaveButton, editCancelButton);
  taskRightGroup.appendChild(taskRightGroupEditContainer);

  taskGroup.append(taskLeftGroup, taskRightGroup);

  return taskGroup;
}