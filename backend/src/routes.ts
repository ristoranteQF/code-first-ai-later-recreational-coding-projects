import { Router } from "express";
import { todos, createTodo, removeTodo } from "./store.js";

const router = Router();

router.get("/", (_req, res) => res.json(todos));

router.post("/", (req, res) => {
  const { title, priority } = req.body;
  res.status(201).json(createTodo(title, priority ?? "Medium"));
});

router.patch("/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.sendStatus(404);
  Object.assign(todo, req.body);
  res.json(todo);
});

router.delete("/:id", (req, res) => {
  removeTodo(Number(req.params.id));
  res.sendStatus(204);
});

export default router;