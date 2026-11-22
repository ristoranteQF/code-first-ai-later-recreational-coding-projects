import { getTaskId, confirmCount, deleteTaskDialog, formContainer, todoContainer, addTaskButton, clearCompletedTasksBtn,
  tasksStatusButtons, trashBinBodyContainer, confirmDeleteTaskButton, confirmDeleteAllButton,
  trashBinButton, quitTrashBinButton, recoverAllTasksButton, deleteAllTasksButton, cancelDeleteAllDialog,
  deleteAllDialog, cancelDeleteTaskButton, currentDate, inputTextField, priorityElement
 } from "./dom.ts";
import { getCurrentDate } from "./utils.ts";
import type { Todo, Priority } from "./types.ts"
import { isPriority, isFilter } from "./guards.ts";
import { state, addTodo, loadTodos, editTask, deleteTask, restoreTask, restoreAllTasks, deletePermanently, emptyTrash, modifyStateTodo } from "./state.ts";
import { render, renderTasks } from "./render.ts";
import { saveState } from "./storage.ts";




document.addEventListener("DOMContentLoaded", async () => {
  await loadTodos();
  render();
  // render current present date
  if (currentDate) {
    currentDate.textContent = getCurrentDate();
  } else {
    console.error("Unknown error has occurred.");
  }
});

// CHANGE: add task with the enter key
formContainer.addEventListener("submit", async e => {
  e.preventDefault();

  // get the text from the input field
  const userInput = inputTextField.value.trim();
  if (!userInput) {
    alert("Please enter something cuh!");
    return;
  }

  const selectedPriority = priorityElement.value;
  const taskPriority: Priority = isPriority(selectedPriority) ? selectedPriority : "Medium";

  try {
    await addTodo(userInput, taskPriority);
  } catch(error){
    console.error(error);
    alert("Could not create the task. Is the server running?");
  }

  // remove everything inside the input text field
  if (inputTextField) {
    inputTextField.value = "";
  }

  priorityElement.value = "Medium";

  render();
})

// CHANGE: checkbox sync with data 
todoContainer.addEventListener("change",  async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

  const id = getTaskId(target);
  if (!id) return;

  try {
    await modifyStateTodo(id, { completed: target.checked });
  } catch(error){
    console.error(error);
    alert(`Coult not update the task: ${error.message}`);
  }

  render();
});

// CLICK: delete/edit/save/cancel button(s)
todoContainer.addEventListener("click", (e) => {
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

  saveState(state);
  render();
});

// KEYDOWN: save task that is in edit mode with the enter key
todoContainer.addEventListener("keydown", (e) => {
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
    saveState(state);
    render();
  } else if (e.key === "Escape") {
    const id = getTaskId(target);
    if (!id) return;

    state.editingStateTasksIds.delete(id);
    saveState(state);
    render();
  }
});

// CLICK: add task button
addTaskButton.addEventListener("click", async () => {
  // get the text from the input field
  const userInput = inputTextField.value.trim();
  if (!userInput) {
    alert("Please enter something cuh!");
    return;
  }

  const selectedPriority = priorityElement.value;
  const taskPriority: Priority = isPriority(selectedPriority) ? selectedPriority : "Medium";

  try {
    await addTodo(userInput, taskPriority);
  } catch(error){
    console.error(error);
    alert("Could not create the task. Is the server running?");
  }

  // remove everything inside the input text field
  if (inputTextField) {
    inputTextField.value = "";
  }

  priorityElement.value = "Medium";

  render();
});

// CLICK: clear completed tasks button
clearCompletedTasksBtn.addEventListener("click", () => {
  state.todos.forEach((todo) => {
    if (todo.completed) {
      todo.deleted = true;
      state.editingStateTasksIds.delete(todo.id);
    }
  });
  saveState(state);

  render();
});

// CLICK: task status buttons functionality
tasksStatusButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedFilter = btn.dataset.filter;
    if (!isFilter(selectedFilter)) return;

    state.currentFilter = selectedFilter;
    saveState(state);
    renderTasks();
  });
});

// CLICK: trash bin button
trashBinButton.addEventListener("click", () => {
  state.currentScreen = "Trash";
  saveState(state);
  render();
});

// CLICK: quit trash bin button
quitTrashBinButton.addEventListener("click", () => {
  state.currentScreen = "Main";
  saveState(state);
  render();
});

// CLICK: recover all tasks button
recoverAllTasksButton.addEventListener("click", () => {
  restoreAllTasks();
  render();
});

// CLICK: delete all tasks button
deleteAllTasksButton.addEventListener("click", () => {
  deleteAllDialog.showModal();

  let countDeletedTasks = 0;
  state.todos.forEach(todo => {
    if(todo.deleted === true){
      countDeletedTasks++;
    }
  });

  if(!confirmCount) return;
  confirmCount.innerHTML = String(countDeletedTasks);
});
cancelDeleteAllDialog.addEventListener("click", () => {
  deleteAllDialog.close();
})
confirmDeleteAllButton.addEventListener("click", () => {
  deleteAllDialog.close();
  emptyTrash();
  render();
})


let pendingDeleteId: string | null = null;
// CLICK: recover task and delete task button(s)
trashBinBodyContainer.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const id = getTaskId(target);
  if (!id) return;

  if (target.closest(".recover-task-button")) {
    restoreTask(id);
  } else if (target.closest(".delete-task-button")) {
    pendingDeleteId = String(id);
    deleteTaskDialog.showModal();
    return;
  } else {
    return;
  }

  render();
});

confirmDeleteTaskButton.addEventListener("click", () => {
  if (pendingDeleteId) deletePermanently(Number(pendingDeleteId));
  pendingDeleteId = null;
  deleteTaskDialog.close();
  render();
})

cancelDeleteTaskButton.addEventListener("click", () => {
  pendingDeleteId = null;
  deleteTaskDialog.close();
})