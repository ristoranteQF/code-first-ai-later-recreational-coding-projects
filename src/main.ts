// DOM elements
const currentDate = document.querySelector<HTMLElement>(".current-date");
const inputTextField = document.querySelector<HTMLInputElement>(".input-text");

const addTaskButton = document.querySelector<HTMLButtonElement>(".add-todo-btn");
const clearCompletedTasksBtn = document.querySelector<HTMLButtonElement>(".clear-completed-tasks-btn");
const tasksStatusButtons = document.querySelectorAll<HTMLButtonElement>("button.tasks-status-btn");
const taskCount = document.querySelector<HTMLSpanElement>(".task-count");
const priorityElement = document.querySelector<HTMLSelectElement>("#priority");

const todoContainer = document.querySelector<HTMLDivElement>(".todo-container");
const noTasksContainer = document.querySelector<HTMLDivElement>(".no-tasks-container");


// TODO: reduce redundancy and make one function instead of 3 for rendering tasks?
// TODO: create a trash bin page where users can recover their deleted tasks


interface Todo {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
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
    completed: false
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
  todos = todos.filter(todo => todo.completed === false);
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
  for(let i = 0; i < todos.length; i++){
    if(todos[i].id === id){
      todos.splice(i, 1);
      break;
    }
  }

  saveTasks();
}





// UI rendering

function renderUIData(){
  const activeTasks = todos.filter(todo => {
      return !todo.completed;
    });

  const tasksCount: number = activeTasks.length;

  if(tasksCount !== 1){
    taskCount ? taskCount.textContent = `${String(tasksCount)} tasks left.` : "Unknown error has occurred.";
  } else {
    taskCount ? taskCount.textContent = `${String(tasksCount)} task left.` : "Unknown error has occurred.";
  }

  const allTasksCount = todos.length;
  const activeTasksCount = todos.filter(todo => !todo.completed).length;
  const completedTasksCount = todos.filter(todo => todo.completed).length;

  document.querySelector<HTMLSpanElement>(".all-tasks-count").textContent = String(allTasksCount);
  document.querySelector<HTMLSpanElement>(".active-tasks-count").textContent = String(activeTasksCount);
  document.querySelector<HTMLSpanElement>(".done-tasks-count").textContent = String(completedTasksCount);
}

function renderAllTasks(){
  if(todos.length === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
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
  const countActive = todos.filter(todo => !todo.completed).length;

  if(countActive === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
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
  const countDone = todos.filter(todo => todo.completed).length;

  if(countDone === 0){
    noTasksContainer?.classList.remove("hidden");
  } else {
    noTasksContainer?.classList.add("hidden");
  }


  if(todoContainer){
    todoContainer.innerHTML = "";
  }

  for(let i = 0; i < todos.length; i++){
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