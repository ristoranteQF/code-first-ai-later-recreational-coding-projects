import { Router } from "express";
import { getTodos, createTodo, updateTodo, clearCompleted, recoverAll, deleteAll, deleteTodoPermanently } from "./store.js";
import { isPriority, parseChanges } from "./guards.js";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await getTodos());
});

router.post("/", async (req, res) => {
  const { title, priority = "Medium" } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "" || !isPriority(priority)) {
    return res.status(400).json({ error: "title must be text and priority must be High, Medium or Low" });
  }
  res.status(201).json(await createTodo(title.trim(), priority));
});

router.post("/clear-completed", async (_req, res) => {
  res.json(await clearCompleted());
});

router.post("/recover-all", async (_req, res) => {
  res.json(await recoverAll());
});

router.delete("/delete-all", async (_req, res) => {
  res.json(await deleteAll());
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be an integer" });

  const changes = parseChanges(req.body);
  if (!changes) return res.status(400).json({ error: "invalid changes" });

  const todo = await updateTodo(id, changes);
  if (!todo) return res.status(404).json({ error: "todo not found" });
  res.json(todo);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be an integer" });

  if (!(await deleteTodoPermanently(id))) {
    return res.status(404).json({ error: "todo not found" });
  }
  res.sendStatus(204);
});

export default router;