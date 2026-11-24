import { getTaskId, confirmCount, deleteTaskDialog, formContainer, todoContainer, addTaskButton, clearCompletedTasksBtn,
  tasksStatusButtons, trashBinBodyContainer, confirmDeleteTaskButton, confirmDeleteAllButton,
  trashBinButton, quitTrashBinButton, recoverAllTasksButton, deleteAllTasksButton, cancelDeleteAllDialog,
  deleteAllDialog, cancelDeleteTaskButton, currentDate, inputTextField, priorityElement
 } from "./dom.ts";
import { getCurrentDate } from "./utils.ts";
import type { Priority } from "./types.ts";
import { isPriority, isFilter } from "./guards.ts";
import { state, addTodo, loadTodos, deleteTodoPermanently, modifyStateTodo, handleClearCompleted, handleRecoverAll, handleDeleteAll } from "./state.ts";
import { countDeleted } from "./selectors.ts";
import { render, renderTasks } from "./render.ts";
import { saveState } from "./storage.ts";

// Runs a server action. On failure: logs, alerts, returns false.
async function run(action: () => Promise<void>, failMessage: string): Promise<boolean> {
  try {
    await action();
    return true;
  } catch (error) {
    console.error(error);

    const msg = error instanceof Error ? error.message : String(error);
    alert(`${failMessage}: ${msg}`);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await run(loadTodos, "Could not load tasks");
  render();
  if (currentDate) {
    currentDate.textContent = getCurrentDate();
  } else {
    console.error("Unknown error has occurred.");
  }
});

// ADD TASK (form submit and button share one function)
async function handleAddTask() {
  const userInput = inputTextField.value.trim();
  if (!userInput) {
    alert("Please enter something cuh!");
    return;
  }

  const selectedPriority = priorityElement.value;
  const taskPriority: Priority = isPriority(selectedPriority) ? selectedPriority : "Medium";

  const ok = await run(() => addTodo(userInput, taskPriority), "Could not create the task");
  if (!ok) return; 

  inputTextField.value = "";
  priorityElement.value = "Medium";
  render();
}

formContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  void handleAddTask();
});
addTaskButton.addEventListener("click", () => void handleAddTask());

// SAVE EDIT (click on Save and Enter key share one function)
async function saveEdit(id: number, newText: string) {
  const ok = await run(() => modifyStateTodo(id, { title: newText }), "Could not save the task");
  if (!ok) return; // stay in edit mode, don't redraw and lose the typed text

  state.editingStateTasksIds.delete(id);
  saveState(state);
  render();
}

// CHECKBOX
todoContainer.addEventListener("change", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

  const id = getTaskId(target);
  if (!id) return;

  await run(() => modifyStateTodo(id, { completed: target.checked }), "Could not update the task");
  render();
});

// CLICK: delete/edit/save/cancel
todoContainer.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const id = getTaskId(target);
  if (!id) return;

  if (target.closest(".delete-btn")) {
    const ok = await run(() => modifyStateTodo(id, { deleted: true }), "Could not delete the task");
   
    if (ok) state.editingStateTasksIds.delete(id);
  } else if (target.closest(".edit-btn")) {
    state.editingStateTasksIds.add(id);
  } else if (target.closest(".edit-save-btn")) {
    const input = target.closest(".task-group")?.querySelector<HTMLInputElement>(".edit-input");
    const newText = input?.value.trim();
    if (!newText) return;
    await saveEdit(id, newText);
    return; // saveEdit already saves and renders
  } else if (target.closest(".edit-cancel-btn")) {
    state.editingStateTasksIds.delete(id);
  } else {
    return;
  }

  saveState(state);
  render();
});

// KEYDOWN in edit mode
todoContainer.addEventListener("keydown", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || !target.matches(".edit-input")) return;

  const id = getTaskId(target);
  if (!id) return;

  if (e.key === "Enter") {
    e.preventDefault();
    const newText = target.value.trim();
    if (!newText) return;
    await saveEdit(id, newText);
  } else if (e.key === "Escape") {
    state.editingStateTasksIds.delete(id);
    saveState(state);
    render();
  }
});

// CLEAR COMPLETED
clearCompletedTasksBtn.addEventListener("click", async () => {
  const ok = await run(handleClearCompleted, "Could not clear completed tasks");
  if (ok) {
    // tasks that went to the trash can't be in edit mode anymore
    state.todos.forEach((t) => {
      if (t.deleted) state.editingStateTasksIds.delete(t.id);
    });
    saveState(state);
  }
  render();
});

// FILTER buttons
tasksStatusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedFilter = btn.dataset.filter;
    if (!isFilter(selectedFilter)) return;

    state.currentFilter = selectedFilter;
    saveState(state);
    renderTasks();
  });
});

// TRASH screen
trashBinButton.addEventListener("click", () => {
  state.currentScreen = "Trash";
  saveState(state);
  render();
});

quitTrashBinButton.addEventListener("click", () => {
  state.currentScreen = "Main";
  saveState(state);
  render();
});

recoverAllTasksButton.addEventListener("click", async () => {
  await run(handleRecoverAll, "Could not recover tasks");
  render();
});

// DELETE ALL (empty trash)
deleteAllTasksButton.addEventListener("click", () => {
  deleteAllDialog.showModal();
  if (confirmCount) confirmCount.textContent = String(countDeleted(state.todos));
});

cancelDeleteAllDialog.addEventListener("click", () => {
  deleteAllDialog.close();
});

confirmDeleteAllButton.addEventListener("click", async () => {
  deleteAllDialog.close();
  if (countDeleted(state.todos) === 0) return;

  await run(handleDeleteAll, "Could not empty the trash");
  render();
});

// TRASH: recover one / delete one
let pendingDeleteId: number | null = null;

trashBinBodyContainer.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const id = getTaskId(target);
  if (!id) return;

  if (target.closest(".recover-task-button")) {
    await run(() => modifyStateTodo(id, { deleted: false }), "Could not recover the task");
  } else if (target.closest(".delete-task-button")) {
    pendingDeleteId = id;
    deleteTaskDialog.showModal();
    return;
  } else {
    return;
  }

  render();
});

confirmDeleteTaskButton.addEventListener("click", async () => {
  const idToDelete = pendingDeleteId;
  pendingDeleteId = null;
  deleteTaskDialog.close();

  if (idToDelete !== null) {
    await run(() => deleteTodoPermanently(idToDelete), "Could not delete the task");
  }
  render();
});

cancelDeleteTaskButton.addEventListener("click", () => {
  pendingDeleteId = null;
  deleteTaskDialog.close();
});