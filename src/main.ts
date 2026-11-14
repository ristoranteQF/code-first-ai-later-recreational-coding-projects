// DOM elements
const currentDate = document.querySelector<HTMLElement>(".current-date");
const inputTextField = document.querySelector<HTMLInputElement>(".input-text");
const formContainer =
  document.querySelector<HTMLFormElement>(".form-container");
const trashBinContainer = document.querySelector<HTMLDivElement>(
  ".trash-bin-screen-container",
);
const emptyTrashBinComponent = document.querySelector<HTMLDivElement>(
  ".empty-trash-bin-body-container",
);
const trashBinBodyContainer = document.querySelector<HTMLDivElement>(
  ".trash-bin-container-body",
);

const addTaskButton =
  document.querySelector<HTMLButtonElement>(".add-todo-btn");
const clearCompletedTasksBtn = document.querySelector<HTMLButtonElement>(
  ".clear-completed-tasks-btn",
);
const tasksStatusButtons = document.querySelectorAll<HTMLButtonElement>(
  "button.tasks-status-btn",
);
const trashBinButton =
  document.querySelector<HTMLButtonElement>(".trash-bin-button");
const quitTrashBinButton = document.querySelector<HTMLButtonElement>(
  ".return-to-tasks-button",
);
const recoverAllTasksButton = document.querySelector<HTMLButtonElement>(
  ".recover-all-tasks-button",
);
const deleteAllTasksButton = document.querySelector<HTMLButtonElement>(
  ".delete-all-tasks-button",
);

const allTasksCountSpan =
  document.querySelector<HTMLSpanElement>(".all-tasks-count");
const activeTasksCountSpan = document.querySelector<HTMLSpanElement>(
  ".active-tasks-count",
);
const doneTasksCountSpan =
  document.querySelector<HTMLSpanElement>(".done-tasks-count");
const taskCount = document.querySelector<HTMLSpanElement>(".task-count");
const priorityElement = document.querySelector<HTMLSelectElement>("#priority");
const todoContainer = document.querySelector<HTMLDivElement>(".todo-container");
const noTasksContainer = document.querySelector<HTMLDivElement>(
  ".no-tasks-container",
);



type Priority = "High" | "Medium" | "Low";
type Filter = "All" | "Active" | "Done";
type Screen = "Main" | "Trash";

interface Todo {
  id: number;
  title: string;
  priority: Priority;
  completed: boolean;
  deleted: boolean;
}

let todos: Todo[] = [];
let currentFilter: Filter = "All";
const editingStateTasksIds: Set<number> = new Set();
let currentScreen: Screen = "Main";


document.addEventListener("DOMContentLoaded", () => {
  todos = loadTasks();
  render();
  // render current present date
  if (currentDate) {
    currentDate.textContent = getCurrentDate();
  } else {
    console.error("Unknown error has occurred.");
  }
});

// CHANGE: checkbox sync with data 
todoContainer?.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox")
    return;

  const taskGroup = target.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);

  const task = todos.find((todo) => todo.id === taskId);
  if (!task) return;

  task.completed = target.checked;

  saveTasks();

  render();
});

// CLICK: delete button
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const deleteBtn = target.closest(".delete-btn");
  if (!deleteBtn) return;

  const taskGroup = deleteBtn.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);

  deleteTask(taskId);
  editingStateTasksIds.delete(taskId);

  render();
});

// CLICK: edit task button
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const editButton = target.closest(".edit-btn");
  if (!editButton) return;
  const taskGroup = editButton.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);
  editingStateTasksIds.add(taskId);

  render();
});

// CLICK: save task button - edit functionality
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const saveButton = target.closest(".edit-save-btn");
  if (!saveButton) return;

  const taskGroup = saveButton.closest(".task-group");
  if (!taskGroup) return;
  const taskId = Number(taskGroup.id.split("-")[1]);
 
  const editTaskInput =
    taskGroup.querySelector<HTMLInputElement>(".edit-input");
  if (!editTaskInput) return;

  // validate the user input first
  const newText = editTaskInput.value.trim();
  if (!newText) return;

  editTask(taskId, newText);
  editingStateTasksIds.delete(taskId);
  render();
});

// CLICK: cancel editing task button
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const editCancelButton = target?.closest(".edit-cancel-btn");
  if (!editCancelButton) return;
  const taskGroup = editCancelButton.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);
  editingStateTasksIds.delete(taskId);
  render();
});

// CLICK: add task button
addTaskButton?.addEventListener("click", () => {
  // get the text from the input field
  const userInput = inputTextField?.value.trim();
  if (!userInput) {
    alert("Please enter something cuh!");
    return;
  }

  const selectedPriority = priorityElement?.value;
  const taskPriority: Priority = isPriority(selectedPriority) ? selectedPriority : "Medium";

  // create a Todo object and push it to the todos global array
  const todoItem: Todo = {
    id: Date.now(),
    title: userInput,
    priority: taskPriority,
    completed: false,
    deleted: false,
  };

  todos.push(todoItem);
  saveTasks();

  // remove everything inside the input text field
  if (inputTextField) {
    inputTextField.value = "";
  }

  render();
});

// CLICK: clear completed tasks button
clearCompletedTasksBtn?.addEventListener("click", () => {
  todos.forEach((todo) => {
    if (todo.completed) {
      todo.deleted = true;
      editingStateTasksIds.delete(todo.id);
    }
  });
  saveTasks();

  render();
});

// CLICK: task status buttons functionality
tasksStatusButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedFilter = btn.dataset.filter;
    if (!isFilter(selectedFilter)) return;

    currentFilter = selectedFilter;
    renderTasks();
  });
});

// CLICK: trash bin button
trashBinButton?.addEventListener("click", () => {
  currentScreen = "Trash";
  render();
});

// CLICK: quit trash bin button
quitTrashBinButton?.addEventListener("click", () => {
  currentScreen = "Main";
  render();
});

// CLICK: recover all tasks button
recoverAllTasksButton?.addEventListener("click", () => {
  restoreAllTasks();
  render();
});

// CLICK: delete all tasks button
deleteAllTasksButton?.addEventListener("click", () => {
  emptyTrash();
  render();
});

// CLICK: recover task button
trashBinBodyContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const recoverButton = target.closest(".recover-task-button");
  if (!recoverButton) return;  

  const deletedTaskGroup = recoverButton.closest(".deleted-task-group");
  if (!deletedTaskGroup) return;
  const taskId = Number(deletedTaskGroup.id.split("-")[1]);

  restoreTask(taskId);
  render();
});

// CLICK: permanently delete task button
trashBinBodyContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const deleteButton = target.closest(".delete-task-button");
  if (!deleteButton) return;

  const deletedTaskGroup = deleteButton.closest(".deleted-task-group");
  if (!deletedTaskGroup) return;
  const taskId = Number(deletedTaskGroup.id.split("-")[1]);

  deletePermanently(taskId);
  render();
});




// localstorage CRUD API

function loadTasks(): Todo[] {
  const data: string | null = localStorage.getItem("todos");

  if (!data) return [];

  try {
    return JSON.parse(String(data));
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveTasks() {
  const data: string = JSON.stringify(todos);
  localStorage.setItem("todos", data);
}

function editTask(id: number, title: string) {
  const task = todos.find((t) => t.id === id);
  if (task) task.title = title;

  saveTasks();
}

function deleteTask(id: number): void {
  const task = todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = true;
  saveTasks();
}

function restoreTask(id: number): void {
  const task = todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = false;
  saveTasks();
}

function restoreAllTasks() {
  todos.forEach((todo) => {
    if (todo.deleted) {
      todo.deleted = false;
    }
  });
  saveTasks();
}

function deletePermanently(id: number): void {
  todos = todos.filter((t) => t.id !== id);
  saveTasks();
}

function emptyTrash(): void {
  todos = todos.filter((t) => !t.deleted);
  saveTasks();
}




// UI rendering

function renderUIData() {
  const activeTasks = todos.filter((todo) => {
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

  const allTasksCount = todos.filter((todo) => !todo.deleted).length;
  const activeTasksCount = todos.filter(
    (todo) => !todo.completed && !todo.deleted,
  ).length;
  const completedTasksCount = todos.filter(
    (todo) => todo.completed && !todo.deleted,
  ).length;

  if (allTasksCountSpan) allTasksCountSpan.textContent = String(allTasksCount);
  if (activeTasksCountSpan)
    activeTasksCountSpan.textContent = String(activeTasksCount);
  if (doneTasksCountSpan)
    doneTasksCountSpan.textContent = String(completedTasksCount);
}
// render the data based on which filter category is present
function renderTasks() {
  syncFilterButtonsState();

  // get only the todos we need
  const filteredTodos = filterTodos(todos, currentFilter);

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
  const taskGroup = editingStateTasksIds.has(todo.id)
    ? createEditTaskElement(todo)
    : createTaskElement(todo);

  todoContainer?.appendChild(taskGroup);
});
}
function renderDeletedTasks() {
  trashBinBodyContainer
    ?.querySelectorAll(".deleted-task-group")
    .forEach((el) => el.remove());

  const countDeleted = todos.filter((todo) => todo.deleted).length;

  if (countDeleted === 0) {
    emptyTrashBinComponent?.classList.remove("hide-element");
  } else {
    emptyTrashBinComponent?.classList.add("hide-element");
  }

  for (const todo of todos) {
    if (!todo.deleted) continue;

    const deletedTaskGroup = deleteTaskElement(todo);
    trashBinBodyContainer?.appendChild(deletedTaskGroup);
  }
}
function render() {
  syncScreenState();

  if (currentScreen === "Main") {
    renderTasks();
    renderUIData();
  } else {
    renderDeletedTasks();
  }
}
function syncFilterButtonsState() {
  tasksStatusButtons.forEach(button => {
    const buttonFilter = button.dataset.filter;

    if (!isFilter(buttonFilter)) {
      console.error("Filter button has a missing or invalid data-filter:", button);
      button.classList.remove("active-status-style");
      return;
    }

    button.classList.toggle("active-status-style", buttonFilter === currentFilter);
  });
}
function syncScreenState() {
  formContainer?.classList.toggle("hide-element", currentScreen !== "Main");
  trashBinContainer?.classList.toggle("hide-element", currentScreen !== "Trash");
}













// DOM builder functions
function createTaskElement(todo: Todo) {
    const taskGroup = document.createElement("div");
    taskGroup.classList.add("task-group");
    taskGroup.id = `task-${todo.id}`;

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
function deleteTaskElement(todo: Todo){
  const deletedTaskGroup = document.createElement("div");
  deletedTaskGroup.classList.add("deleted-task-group");
  deletedTaskGroup.id = `task-${todo.id}`
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
function createEditTaskElement(todo: Todo){
  const taskGroup = document.createElement("div");
  taskGroup.classList.add("task-group", "task-group-editing");
  taskGroup.id = `task-${todo.id}`;

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







// Data / Utility functions
function getCurrentDate(): string {
  const days: string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const now = new Date();
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth();

  const formattedDate = `${days[day]}, ${date} ${months[month]}`;
  return formattedDate;
}

function filterTodos(todos: Todo[], currentFilter: Filter){
  const filteredTodos = todos.filter(todo => {
    if(todo.deleted) return false;

    if(currentFilter === "Active") return !todo.completed;
    if(currentFilter === "Done") return todo.completed;

    // if it's all, keep the todo
    return true;
  });

  return filteredTodos;
}




// Type guards
function isPriority(value: unknown): value is Priority {
  return value === "High" || value === "Medium" || value === "Low";
}

function isFilter(value: unknown): value is Filter {
  return value === "All" || value === "Active" || value === "Done";
}