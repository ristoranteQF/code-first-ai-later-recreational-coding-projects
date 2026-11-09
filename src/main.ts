// DOM elements
const currentDate = document.querySelector<HTMLElement>(".current-date");
const inputTextField = document.querySelector<HTMLInputElement>(".input-text");
const addTaskButton = document.querySelector<HTMLButtonElement>(".add-todo-btn");
const taskCount = document.querySelector<HTMLSpanElement>(".task-count");
const priorityElement = document.querySelector<HTMLSelectElement>("#priority");

const todoContainer = document.querySelector<HTMLDivElement>(".todo-container");
const noTasksContainer = document.querySelector<HTMLDivElement>(".no-tasks-container");



// TODO: create a trash bin page where users can recover their deleted tasks
// TODO: edit task function from the localstorage API

interface Todo {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
}

let todos: Todo[] = [];


document.addEventListener("DOMContentLoaded", () => {
  const userTasks: Todo[] = loadTasks() || [];
  todos = userTasks;
  renderTasks();
})


// CHANGE: checkbox
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
  renderTasks();
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
  renderTasks();
});



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

  // render the freshly updated data
  renderTasks();
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

// TODO
function editTask(id: number){
  
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
// function renderTasks(){

//   if(todos.length === 0){
//     noTasksContainer?.classList.remove("hidden");
//   } else {
//     noTasksContainer?.classList.add("hidden");
//   }


//   if(todoContainer){
//     todoContainer.innerHTML = "";
//   }

//   for(let i = 0; i < todos.length; i++){
//     const taskGroup = document.createElement("div");
//     taskGroup.classList.add("task-group");
//     taskGroup.id = `task-${todos[i].id}`;

//     const taskLeftGroup = document.createElement("div");
//     taskLeftGroup.classList.add("task-left-group");
//     const taskRightGroup = document.createElement("div");
//     taskRightGroup.classList.add("task-right-group");


//     const taskCheckbox = document.createElement("input");
//     taskCheckbox.type = "checkbox";
//     taskCheckbox.name = "task";
//     taskCheckbox.id = `task-checkbox-${todos[i].id}`;
//     taskCheckbox.checked = true ? todos[i].completed : false;

//     const taskLabel = document.createElement("label");
//     taskLabel.htmlFor = `task-checkbox-${todos[i].id}`;
//     taskLabel.textContent = `${todos[i].title}`;
//     if(todos[i].completed){
//       taskLabel.classList.add("completed-task");
//     } else {
//       taskLabel.classList.remove("completed-task");
//     }

//     taskLeftGroup.appendChild(taskCheckbox);
//     taskLeftGroup.appendChild(taskLabel);


//     const deleteTaskBtn = document.createElement("button");
//     deleteTaskBtn.classList.add("delete-btn");
//     const deleteBtnIcon = document.createElement("i");
//     deleteBtnIcon.classList.add("fa-solid", "fa-trash-can");
//     deleteTaskBtn.appendChild(deleteBtnIcon);

//     taskRightGroup.appendChild(deleteTaskBtn);

//     taskGroup.appendChild(taskLeftGroup);
//     taskGroup.appendChild(taskRightGroup);


//     todoContainer?.appendChild(taskGroup);
//   }


//   let activeTasks = todos.filter(todo => {
//     return !todo.completed;
//   });

//   const tasksCount: number = activeTasks.length;

//   if(tasksCount !== 1){
//     taskCount ? taskCount.textContent = `${String(tasksCount)} tasks left.` : "Unknown error has occurred.";
//   } else {
//     taskCount ? taskCount.textContent = `${String(tasksCount)} task left.` : "Unknown error has occurred.";
//   }


//   // render current present date
//   currentDate ? currentDate.textContent = getCurrentDate() : "Unknown error has occurred.";
// }






// Utility functions
function getCurrentDate(): string {
  const days: String[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months: String[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const now = new Date();
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth();

  const formattedDate = `${days[day]}, ${date} ${months[month]}`;
  return formattedDate;
}