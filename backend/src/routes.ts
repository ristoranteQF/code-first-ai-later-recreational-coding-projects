import { Router } from "express";
import { todos, createTodo, updateTodo, clearCompleted, recoverAll, deleteAll, deleteTodoPermanently } from "./store.js";
import { isPriority, parseChanges } from "./guards.js";

const router = Router();

router.get("/", (_req, res) => res.json(todos));

router.post("/", (req, res) => {
  const { title, priority = "Medium" } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "" || !isPriority(priority)) {
    return res.status(400).json({ error: "title must be text and priority must be High, Medium or Low" });
  }
  res.status(201).json(createTodo(title.trim(), priority));
});

router.post("/clear-completed", (_req, res) => {
  res.json(clearCompleted());
});

router.post("/recover-all", (_req, res) => {
  res.json(recoverAll());
});

router.delete("/delete-all", (_req, res) => {
  res.json(deleteAll());
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const changes = parseChanges(req.body);
  if (!changes) return res.status(400).json({ error: "invalid changes" });

  const todo = updateTodo(id, changes);
  if (!todo) return res.status(404).json({ error: "todo not found" });
  res.json(todo);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id must be an integer" });
  }
  if (!deleteTodoPermanently(id)) {
    return res.status(404).json({ error: "todo not found" });
  }
  res.sendStatus(204);
});

export default router;