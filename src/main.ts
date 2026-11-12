// DOM elements
const currentDate = document.querySelector<HTMLElement>(".current-date");
const inputTextField = document.querySelector<HTMLInputElement>(".input-text");
const formContainer = document.querySelector<HTMLFormElement>(".form-container");
const trashBinContainer = document.querySelector<HTMLDivElement>(".trash-bin-screen-container");
const emptyTrashBinComponent = document.querySelector<HTMLDivElement>(".empty-trash-bin-body-container");
const trashBinBodyContainer = document.querySelector<HTMLDivElement>(".trash-bin-container-body");

const addTaskButton = document.querySelector<HTMLButtonElement>(".add-todo-btn");
const clearCompletedTasksBtn = document.querySelector<HTMLButtonElement>(".clear-completed-tasks-btn");
const tasksStatusButtons = document.querySelectorAll<HTMLButtonElement>("button.tasks-status-btn");
const trashBinButton = document.querySelector<HTMLButtonElement>(".trash-bin-button");
const quitTrashBinButton = document.querySelector<HTMLButtonElement>(".return-to-tasks-button");

const taskCount = document.querySelector<HTMLSpanElement>(".task-count");
const priorityElement = document.querySelector<HTMLSelectElement>("#priority");
const todoContainer = document.querySelector<HTMLDivElement>(".todo-container");
const noTasksContainer = document.querySelector<HTMLDivElement>(".no-tasks-container");


// TODO: reduce redundancy and make one function instead of 3 for rendering tasks?


interface Todo {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  deleted: boolean;
}

let todos: Todo[] = [];


document.addEventListener("DOMContentLoaded", () => {
  todos = loadTasks() || [];
  renderAllTasks();
  renderUIData();
  // render current present date
  currentDate ? currentDate.textContent = getCurrentDate() : "Unknown error has occurred.";
})


// CHANGE: checkbox sync with data (todos array + localstorage)
todoContainer?.addEventListener("change", e => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

  const taskGroup = target.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);

  const task = todos.find(todo => todo.id === taskId);
  if (!task) return;

  task.completed = target.checked;

  saveTasks();
  
  // render the freshly updated data based on which status category is present on the UI
  let taskStatusCategory: string = "";
  tasksStatusButtons.forEach(btn => {
    if(btn.classList.contains("active-status-style")){
      taskStatusCategory = btn.textContent.split(" ")[0];
    }
  })

  if(taskStatusCategory === "All"){
    renderAllTasks();
  } else if(taskStatusCategory === "Active"){
    renderActiveTasks();
  } else if(taskStatusCategory === "Done"){
    renderCompletedTasks();
  } else {
    console.error("An unknown error has occurred.");
  }

  renderUIData();
});

// CLICK: delete button
todoContainer?.addEventListener("click", e => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const deleteBtn = target.closest(".delete-btn");
  if (!deleteBtn) return;

  const taskGroup = deleteBtn.closest(".task-group");
  if (!taskGroup) return;

  const taskId = Number(taskGroup.id.split("-")[1]);

  deleteTask(taskId);
  
  // render the UI based on which status category button has the .active-status-style
  let taskStatusCategory: string = "";
  tasksStatusButtons.forEach(btn => {
    if(btn.classList.contains("active-status-style")){
      taskStatusCategory = btn.textContent.split(" ")[0];
    }
  })

  if(taskStatusCategory === "All"){
    renderAllTasks();
  } else if(taskStatusCategory === "Active"){
    renderActiveTasks();
  } else if(taskStatusCategory === "Done"){
    renderCompletedTasks();
  } else {
    console.error("An unknown error has occurred.");
  }

  renderUIData();
});

// CLICK: edit task button
todoContainer?.addEventListener("click", e => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const editButton = target.closest(".edit-btn");
  if(!editButton) return;
  const taskGroup = editButton.closest(".task-group");
  taskGroup?.classList.add("task-group-editing");
  if(!taskGroup) return;

  const taskCheckbox = taskGroup.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (taskCheckbox) taskCheckbox.disabled = true;

  const inputLabel = taskGroup.querySelector<HTMLLabelElement>(".input-label");
  const editTaskInput = taskGroup.querySelector<HTMLInputElement>(".edit-input");
  const taskRightGroupContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-container");
  const taskRightGroupEditContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-edit-container");

  if(!inputLabel || !editTaskInput) return;
  if(!taskRightGroupContainer || !taskRightGroupEditContainer) return;

  editTaskInput.value = inputLabel.textContent ?? "" ;
  inputLabel.hidden = true;
  editTaskInput.hidden = false;
  taskRightGroupContainer.classList.add("hide-element");
  taskRightGroupEditContainer.classList.remove("hide-element");
});

// CLICK: save task button - edit functionality
todoContainer?.addEventListener("click", (e) => {
  const target = e.target;
  if(!(target instanceof Element)) return;

  const saveButton = target.closest(".edit-save-btn");
  if(!saveButton) return;

  const taskGroup = saveButton.closest(".task-group");
  if(!taskGroup) return;
  const taskId = Number(taskGroup.id.split("-")[1]);
  const taskCheckbox = taskGroup.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if(!taskCheckbox) return;

  const inputLabel = taskGroup.querySelector<HTMLLabelElement>(".input-label");
  const editTaskInput = taskGroup.querySelector<HTMLInputElement>(".edit-input");
  const taskRightGroupContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-container");
  const taskRightGroupEditContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-edit-container");

  if(!inputLabel || !editTaskInput) return;
  if(!taskRightGroupContainer || !taskRightGroupEditContainer) return;


  // validate the user input first
  const newText = editTaskInput.value.trim();
  if (!newText) return;

  editTask(taskId, newText);
  
  taskGroup.classList.remove("task-group-editing");
  taskCheckbox.disabled = false; 
  inputLabel.textContent = newText;
  editTaskInput.hidden = true;
  inputLabel.hidden = false;
  taskRightGroupEditContainer.classList.add("hide-element");
  taskRightGroupContainer.classList.remove("hide-element");
})

// CLICK: cancel editing task button
todoContainer?.addEventListener("click", e => {
  const target = e.target;
  if(!(target instanceof Element)) return;

  const editCancelButton = target?.closest(".edit-cancel-btn");
  if(!editCancelButton) return;
  const taskGroup = editCancelButton.closest(".task-group");
  taskGroup?.classList.remove("task-group-editing");
  if(!taskGroup) return;

  const taskCheckbox = taskGroup.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (taskCheckbox) taskCheckbox.disabled = false;

  const inputLabel = taskGroup.querySelector<HTMLLabelElement>(".input-label");
  const editTaskInput = taskGroup.querySelector<HTMLInputElement>(".edit-input");
  const taskRightGroupContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-container");
  const taskRightGroupEditContainer = taskGroup.querySelector<HTMLDivElement>(".task-right-group-edit-container");

  if(!inputLabel || !editTaskInput) return;
  if(!taskRightGroupContainer || !taskRightGroupEditContainer) return;

  // console.log("editCancelButton");
    // inputLabel.textContent = editTaskInput.value;
  editTaskInput.hidden = true;
  inputLabel.hidden = false;
  taskRightGroupEditContainer.classList.add("hide-element");
  taskRightGroupContainer.classList.remove("hide-element");
})

// CLICK: add task button
addTaskButton?.addEventListener("click", () => {
  // get the text from the input field
  const userInput = inputTextField?.value.trim();
  if(!userInput) {
    alert("Please enter something cuh!");
    return;
  }

  const taskPriority = priorityElement?.value;

  // create a Todo object and push it to the todos global array
  const todoItem: Todo = {
    id: Date.now(),
    title: String(userInput),
    priority: String(taskPriority),
    completed: false,
    deleted: false
  }

  todos.push(todoItem);
  saveTasks();

  // remove everything inside the input text field
  if(inputTextField){
    inputTextField.value = "";
  }

  // render the freshly updated data based on which status category is present on the UI
  let taskStatusCategory: string = "";
  tasksStatusButtons.forEach(btn => {
    if(btn.classList.contains("active-status-style")){
      taskStatusCategory = btn.textContent.split(" ")[0];
    }
  })

  if(taskStatusCategory === "All"){
    renderAllTasks();
  } else if(taskStatusCategory === "Active"){
    renderActiveTasks();
  } else if(taskStatusCategory === "Done"){
    renderCompletedTasks();
  } else {
    console.error("An unknown error has occurred.");
  }

  renderUIData();
});

// CLICK: clear completed tasks button
clearCompletedTasksBtn?.addEventListener("click", () => {
  todos.forEach(todo => {
    if(todo.completed){
      todo.deleted = true;
    }
  })
  saveTasks();
  

  // render the freshly updated data based on which status category is present on the UI
  let taskStatusCategory: string = "";
  tasksStatusButtons.forEach(btn => {
    if(btn.classList.contains("active-status-style")){
      taskStatusCategory = btn.textContent.split(" ")[0];
    }
  })

  if(taskStatusCategory === "All"){
    renderAllTasks();
  } else if(taskStatusCategory === "Active"){
    renderActiveTasks();
  } else if(taskStatusCategory === "Done"){
    renderCompletedTasks();
  } else {
    console.error("An unknown error has occurred.");
  }

  renderUIData();
})

// CLICK: task status buttons functionality
tasksStatusButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // remove the active class from the previous button
    tasksStatusButtons.forEach(button => {
      button.classList.remove("active-status-style");
    })
    // add active class to the pressed button
    btn.classList.add("active-status-style");
    // get the button text for filtering the tasks based on it
    const taskStatus = String(btn.textContent.split(" ")[0]);
    // render only the relevant tasks
    if(taskStatus === "All"){
      renderAllTasks();
    } else if(taskStatus === "Active"){
      renderActiveTasks();
    } else if(taskStatus === "Done"){
      renderCompletedTasks();
    } else {
      console.error("An error has occurred. Task status is invalid or something...")
    }
  })
})

// CLICK: trash bin button
trashBinButton?.addEventListener("click", () => {
  formContainer?.classList.add("hide-element");
  trashBinContainer?.classList.remove("hide-element"); 
  renderDeletedTasks();
});


// CLICK: quit trash bin button
quitTrashBinButton?.addEventListener("click", () => {
  console.log("working");

  trashBinContainer?.classList.add("hide-element");
  formContainer?.classList.remove("hide-element");
})










// localstorage CRUD API

function loadTasks(): Todo[] {
  const data: string | null = localStorage.getItem("todos");

  if(!data) return [];

  try {
    return JSON.parse(String(data));
  } 
  catch(error){
    console.error(error);
    return [];
  }
}

function saveTasks(){
  if(!todos) return;

  const data: string = JSON.stringify(todos);
  localStorage.setItem("todos", data);
}

function editTask(id: number, title: string){
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

function deletePermanently(id: number): void {
  todos = todos.filter((t) => t.id !== id);
  saveTasks();
}

function emptyTrash(): void {
  todos = todos.filter((t) => !t.deleted);
  saveTasks();
}










// UI rendering

function renderUIData(){
  const activeTasks = todos.filter(todo => {
      return !todo.completed && !todo.deleted;
    }).length;

  const tasksCount: number = activeTasks;

  if(tasksCount !== 1){
    taskCount ? taskCount.textContent = `${String(tasksCount)} tasks left.` : "Unknown error has occurred.";
  } else {
    taskCount ? taskCount.textContent = `${String(tasksCount)} task left.` : "Unknown error has occurred.";
  }

  const allTasksCount = todos.filter(todo => !todo.deleted).length;
  const activeTasksCount = todos.filter(todo => !todo.completed && !todo.deleted).length;
  const completedTasksCount = todos.filter(todo => todo.completed && !todo.deleted).length;

  document.querySelector<HTMLSpanElement>(".all-tasks-count").textContent = String(allTasksCount);
  document.querySelector<HTMLSpanElement>(".active-tasks-count").textContent = String(activeTasksCount);
  document.querySelector<HTMLSpanElement>(".done-tasks-count").textContent = String(completedTasksCount);
}

function renderAllTasks(){
  const nonDeletedTasksCount = todos.filter(todo => !todo.deleted).length;

  if(nonDeletedTasksCount === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
    if(todos[i].deleted) continue;

    const taskGroup = document.createElement("div");
    taskGroup.classList.add("task-group");
    taskGroup.id = `task-${todos[i].id}`;

    const taskLeftGroup = document.createElement("div");
    taskLeftGroup.classList.add("task-left-group");
    const taskRightGroup = document.createElement("div");
    taskRightGroup.classList.add("task-right-group");


    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.name = "task";
    taskCheckbox.id = `task-checkbox-${todos[i].id}`;
    taskCheckbox.checked = true ? todos[i].completed : false;
    const taskLabel = document.createElement("label");
    taskLabel.htmlFor = `task-checkbox-${todos[i].id}`;
    taskLabel.textContent = `${todos[i].title}`;
    taskLabel.classList.add("input-label");
    if(todos[i].completed){
      taskLabel.classList.add("completed-task");
    } else {
      taskLabel.classList.remove("completed-task");
    }
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.classList.add("edit-input");
    editInput.setAttribute("hidden", "");

    taskLeftGroup.append(taskCheckbox, taskLabel, editInput);


    
    const taskRightGroupContainer = document.createElement("div");
    taskRightGroupContainer.classList.add("task-right-group-container");
    const priorityElement = document.createElement("span");
    priorityElement.classList.add("priority-element");
    let priorityElementType = todos[i].priority.toLowerCase();
    priorityElement.classList.add(`priority-element-${priorityElementType}-styles`);
    priorityElement.textContent = todos[i].priority;
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


    const taskRightGroupEditContainer = document.createElement("div");
    taskRightGroupEditContainer.classList.add("task-right-group-edit-container", "hide-element");
    const editSaveButton = document.createElement("button");
    editSaveButton.type = "button";
    editSaveButton.classList.add("edit-save-btn");
    editSaveButton.textContent = "Save";
    const editCancelButton = document.createElement("button");
    editCancelButton.type = "button";
    editCancelButton.textContent = "Cancel";
    editCancelButton.classList.add("edit-cancel-btn");
    taskRightGroupEditContainer.append(editSaveButton, editCancelButton);


    taskRightGroup.append(taskRightGroupContainer, taskRightGroupEditContainer);
    taskGroup.append(taskLeftGroup, taskRightGroup);


    todoContainer?.appendChild(taskGroup);
  }
}

function renderActiveTasks(){
  const countActive = todos.filter(todo => !todo.completed && !todo.deleted).length;

  if(countActive === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
    if(todos[i].deleted) continue;

    if(!todos[i].completed){
      const taskGroup = document.createElement("div");
    taskGroup.classList.add("task-group");
    taskGroup.id = `task-${todos[i].id}`;

    const taskLeftGroup = document.createElement("div");
    taskLeftGroup.classList.add("task-left-group");
    const taskRightGroup = document.createElement("div");
    taskRightGroup.classList.add("task-right-group");


    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.name = "task";
    taskCheckbox.id = `task-checkbox-${todos[i].id}`;
    taskCheckbox.checked = true ? todos[i].completed : false;

    const taskLabel = document.createElement("label");
    taskLabel.htmlFor = `task-checkbox-${todos[i].id}`;
    taskLabel.textContent = `${todos[i].title}`;
    taskLabel.classList.add("input-label");
    if(todos[i].completed){
      taskLabel.classList.add("completed-task");
    } else {
      taskLabel.classList.remove("completed-task");
    }

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.classList.add("edit-input");
    editInput.setAttribute("hidden", "");

    taskLeftGroup.append(taskCheckbox, taskLabel, editInput);


    
    const taskRightGroupContainer = document.createElement("div");
    taskRightGroupContainer.classList.add("task-right-group-container");
    const priorityElement = document.createElement("span");
    priorityElement.classList.add("priority-element");
    let priorityElementType = todos[i].priority.toLowerCase();
    priorityElement.classList.add(`priority-element-${priorityElementType}-styles`);
    priorityElement.textContent = todos[i].priority;
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


    const taskRightGroupEditContainer = document.createElement("div");
    taskRightGroupEditContainer.classList.add("task-right-group-edit-container", "hide-element");
    const editSaveButton = document.createElement("button");
    editSaveButton.type = "button";
    editSaveButton.classList.add("edit-save-btn");
    editSaveButton.textContent = "Save";
    const editCancelButton = document.createElement("button");
    editCancelButton.type = "button";
    editCancelButton.classList.add("edit-cancel-btn");
    editCancelButton.textContent = "Cancel";
    taskRightGroupEditContainer.append(editSaveButton, editCancelButton);


    taskRightGroup.append(taskRightGroupContainer, taskRightGroupEditContainer);
    taskGroup.append(taskLeftGroup, taskRightGroup);


    todoContainer?.appendChild(taskGroup);
    }
  }
}

function renderCompletedTasks(){
  const countDone = todos.filter(todo => todo.completed && !todo.deleted).length;

  if(countDone === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
    if(todos[i].deleted) continue;

    if(todos[i].completed){
      const taskGroup = document.createElement("div");
    taskGroup.classList.add("task-group");
    taskGroup.id = `task-${todos[i].id}`;

    const taskLeftGroup = document.createElement("div");
    taskLeftGroup.classList.add("task-left-group");
    const taskRightGroup = document.createElement("div");
    taskRightGroup.classList.add("task-right-group");


    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.name = "task";
    taskCheckbox.id = `task-checkbox-${todos[i].id}`;
    taskCheckbox.checked = true ? todos[i].completed : false;

    const taskLabel = document.createElement("label");
    taskLabel.htmlFor = `task-checkbox-${todos[i].id}`;
    taskLabel.textContent = `${todos[i].title}`;
    taskLabel.classList.add("input-label");
    if(todos[i].completed){
      taskLabel.classList.add("completed-task");
    } else {
      taskLabel.classList.remove("completed-task");
    }

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.classList.add("edit-input");
    editInput.setAttribute("hidden", "");

    taskLeftGroup.append(taskCheckbox, taskLabel, editInput);


    
    const taskRightGroupContainer = document.createElement("div");
    taskRightGroupContainer.classList.add("task-right-group-container");
    const priorityElement = document.createElement("span");
    priorityElement.classList.add("priority-element");
    let priorityElementType = todos[i].priority.toLowerCase();
    priorityElement.classList.add(`priority-element-${priorityElementType}-styles`);
    priorityElement.textContent = todos[i].priority;
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


    const taskRightGroupEditContainer = document.createElement("div");
    taskRightGroupEditContainer.classList.add("task-right-group-edit-container", "hide-element");
    const editSaveButton = document.createElement("button");
    editSaveButton.type = "button";
    editSaveButton.classList.add("edit-save-btn");
    editSaveButton.textContent = "Save";
    const editCancelButton = document.createElement("button");
    editCancelButton.type = "button";
    editCancelButton.classList.add("edit-cancel-btn");
    editCancelButton.textContent = "Cancel";
    taskRightGroupEditContainer.append(editSaveButton, editCancelButton);


    taskRightGroup.append(taskRightGroupContainer, taskRightGroupEditContainer);
    taskGroup.append(taskLeftGroup, taskRightGroup);


    todoContainer?.appendChild(taskGroup);
    }
  }
}

function renderDeletedTasks(){
  if(trashBinBodyContainer) {trashBinBodyContainer.innerHTML = ""};
  const countDeleted = todos.filter(todo => todo.deleted).length;

  if(countDeleted === 0){
    emptyTrashBinComponent?.classList.remove("hide-element");
  } else {
    emptyTrashBinComponent?.classList.add("hide-element");
  }


  for(let todo of todos){
    if(!todo.deleted) continue;

    // just making sure :)
    if(todo.deleted){
      const deletedTaskGroup = document.createElement("div");
      deletedTaskGroup.classList.add("deleted-task-group");
      deletedTaskGroup.id = `task-${todo.id}`;

      const deletedTaskLeftGroup = document.createElement("div");
      deletedTaskLeftGroup.classList.add("deleted-task-left-group");
      const deletedInputLabel = document.createElement("label");
      deletedInputLabel.classList.add("deleted-input-label");
      deletedInputLabel.textContent = `${todo.title}`;
      deletedTaskLeftGroup.appendChild(deletedInputLabel);

      const deletedTaskRightGroup = document.createElement("div");
      deletedTaskRightGroup.classList.add("deleted-task-right-group");
      const recoverTaskButton = document.createElement("button");
      recoverTaskButton.classList.add("recover-task-button");
      recoverTaskButton.type = "button";
      recoverTaskButton.textContent = "Recover"
      const leftArrowIcon = document.createElement("i");
      leftArrowIcon.classList.add("fa", "fa-arrow-left-rotate");
      recoverTaskButton.appendChild(leftArrowIcon);
      const deleteTaskButton = document.createElement("button");
      deleteTaskButton.classList.add("delete-task-button");
      deleteTaskButton.type = "button";
      deleteTaskButton.textContent = "Delete";
      const warningIcon = document.createElement("i");
      warningIcon.classList.add("fa", "fa-warning");
      warningIcon.textContent = "Delete";
      deletedTaskRightGroup.append(recoverTaskButton, deleteTaskButton);

      deletedTaskGroup.append(deletedTaskLeftGroup, deletedTaskRightGroup);

      trashBinBodyContainer?.appendChild(deletedTaskGroup);
    }
  }
}






// Utility functions
function getCurrentDate(): string {
  const days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const now = new Date();
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth();

  const formattedDate = `${days[day]}, ${date} ${months[month]}`;
  return formattedDate;
}