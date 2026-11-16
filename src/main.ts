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
const deleteAllDialog = document.querySelector<HTMLDialogElement>(".confirm");
const cancelDeleteAllDialog = document.querySelector<HTMLButtonElement>("#confirmCancel");
const confirmDeleteAllButton = document.querySelector<HTMLButtonElement>(".confirm-delete");
const confirmCount = document.querySelector<HTMLSpanElement>("#confirmCount");




const STORAGE_KEY = "todoAppState";

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

type State = {
  todos: Todo[];
  currentFilter: Filter;
  currentScreen: Screen;
  editingStateTasksIds: Set<number>;
}

let state: State = {
  todos: [],
  currentFilter: "All",
  currentScreen: "Main",
  editingStateTasksIds: new Set<number>()
}



document.addEventListener("DOMContentLoaded", () => {
  state = loadState();
  render();
  // render current present date
  if (currentDate) {
    currentDate.textContent = getCurrentDate();
  } else {
    console.error("Unknown error has occurred.");
  }
});

// CHANGE: add task with the enter key
formContainer?.addEventListener("submit", (e) => {
  e.preventDefault();

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

  state.todos.push(todoItem);
  saveState();

  // remove everything inside the input text field
  if (inputTextField) {
    inputTextField.value = "";
  }

  render();
})

// CHANGE: checkbox sync with data 
todoContainer?.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

  const id = getTaskId(target);
  if (!id) return;

  const task = state.todos.find((t) => t.id === id);
  if (!task) return;

  task.completed = target.checked;
  saveState();
  render();
});

// CLICK: delete/edit/save/cancel button(s)
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const id = getTaskId(target);
  if (!id) return;

  if (target.closest(".delete-btn")) {
    deleteTask(id);
    state.editingStateTasksIds.delete(id);
  } else if (target.closest(".edit-btn")) {
    state.editingStateTasksIds.add(id);
  } else if (target.closest(".edit-save-btn")) {
    const input = target.closest(".task-group")?.querySelector<HTMLInputElement>(".edit-input");
    const newText = input?.value.trim();
    if (!newText) return;
    editTask(id, newText);
    state.editingStateTasksIds.delete(id);
  } else if (target.closest(".edit-cancel-btn")) {
    state.editingStateTasksIds.delete(id);
  } else {
    return;
  }

  saveState();
  render();
});

// KEYDOWN: save task that is in edit mode with the enter key
todoContainer?.addEventListener("keydown", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || !target.matches(".edit-input")) return;

  if (e.key === "Enter") {
    e.preventDefault();

    const id = getTaskId(target);
    if (!id) return;

    const newText = target.value.trim();
    if (!newText) return;

    editTask(id, newText);
    state.editingStateTasksIds.delete(id);
    saveState();
    render();
  } else if (e.key === "Escape") {
    const id = getTaskId(target);
    if (!id) return;

    state.editingStateTasksIds.delete(id);
    saveState();
    render();
  }
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

  state.todos.push(todoItem);
  saveState();

  // remove everything inside the input text field
  if (inputTextField) {
    inputTextField.value = "";
  }

  render();
});

// CLICK: clear completed tasks button
clearCompletedTasksBtn?.addEventListener("click", () => {
  state.todos.forEach((todo) => {
    if (todo.completed) {
      todo.deleted = true;
      state.editingStateTasksIds.delete(todo.id);
    }
  });
  saveState();

  render();
});

// CLICK: task status buttons functionality
tasksStatusButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedFilter = btn.dataset.filter;
    if (!isFilter(selectedFilter)) return;

    state.currentFilter = selectedFilter;
    saveState();
    renderTasks();
  });
});

// CLICK: trash bin button
trashBinButton?.addEventListener("click", () => {
  state.currentScreen = "Trash";
  saveState();
  render();
});

// CLICK: quit trash bin button
quitTrashBinButton?.addEventListener("click", () => {
  state.currentScreen = "Main";
  saveState();
  render();
});

// CLICK: recover all tasks button
recoverAllTasksButton?.addEventListener("click", () => {
  restoreAllTasks();
  render();
});

// CLICK: delete all tasks button
deleteAllTasksButton?.addEventListener("click", () => {
  deleteAllDialog?.showModal();

  let countDeletedTasks = 0;
  state.todos.forEach(todo => {
    if(todo.deleted === true){
      countDeletedTasks++;
    }
  });

  if(!confirmCount) return;
  confirmCount.innerHTML = String(countDeletedTasks);
});
cancelDeleteAllDialog?.addEventListener("click", () => {
  deleteAllDialog?.close();
})
confirmDeleteAllButton?.addEventListener("click", () => {
  deleteAllDialog?.close();
  emptyTrash();
  render();
})

// CLICK: recover task and delete task button(s)
trashBinBodyContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const id = getTaskId(target);
  if (!id) return;

  if (target.closest(".recover-task-button")) {
    restoreTask(id);
  } else if (target.closest(".delete-task-button")) {
    deletePermanently(id);
  } else {
    return;
  }

  render();
});





// localstorage CRUD API

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;

    const saved = JSON.parse(raw);

    return {
      todos: Array.isArray(saved.todos) ? saved.todos : state.todos,
      currentFilter: isFilter(saved.currentFilter)
        ? saved.currentFilter
        : state.currentFilter,
      currentScreen: saved.currentScreen === "Trash" ? "Trash" : "Main",
      editingStateTasksIds: new Set<number>(
        Array.isArray(saved.editingStateTasksIds)
          ? saved.editingStateTasksIds
          : [],
      ),
    };
  } catch {
    return state;
  }
}

function saveState() {
  try {
    const serializable = {
      ...state,
      editingStateTasksIds: [...state.editingStateTasksIds], 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

function editTask(id: number, title: string) {
  const task = state.todos.find((t) => t.id === id);
  if (task) task.title = title;

  saveState();
}

function deleteTask(id: number): void {
  const task = state.todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = true;
  saveState();
}

function restoreTask(id: number): void {
  const task = state.todos.find((t) => t.id === id);
  if (!task) return;
  task.deleted = false;
  saveState();
}

function restoreAllTasks() {
  state.todos.forEach((todo) => {
    if (todo.deleted) {
      todo.deleted = false;
    }
  });
  saveState();
}

function deletePermanently(id: number): void {
  state.todos = state.todos.filter((t) => t.id !== id);
  saveState();
}

function emptyTrash(): void {
  state.todos = state.todos.filter((t) => !t.deleted);
  saveState();
}




// UI rendering

function renderUIData() {
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
function renderTasks() {
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
function renderDeletedTasks() {
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
function render() {
  syncScreenState();

  if (state.currentScreen === "Main") {
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

    button.classList.toggle("active-status-style", buttonFilter === state.currentFilter);
  });
}
function syncScreenState() {
  formContainer?.classList.toggle("hide-element", state.currentScreen !== "Main");
  trashBinContainer?.classList.toggle("hide-element", state.currentScreen !== "Trash");
}













// DOM builder functions
function createTaskElement(todo: Todo) {
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
function deleteTaskElement(todo: Todo){
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
function createEditTaskElement(todo: Todo){
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

function getTaskId(target: Element): number | undefined {
  const group = target.closest<HTMLElement>("[data-id]");
  if(!group) return;

  const id = Number(group.dataset.id);
  return id;
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