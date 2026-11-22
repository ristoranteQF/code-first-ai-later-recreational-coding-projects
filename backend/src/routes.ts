import { Router } from "express";
import { todos, createTodo, updateTodo } from "./store.js";
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

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const changes = parseChanges(req.body);
  if (!changes) return res.status(400).json({ error: "invalid changes" });

  const todo = updateTodo(id, changes);
  if (!todo) return res.sendStatus(404);
  res.json(todo);
});

export default router;