import { Router } from "express";
import { todos, createTodo, checkTodo, removeTodo } from "./store.js";

const router = Router();

router.get("/", (_req, res) => res.json(todos));

router.post("/", (req, res) => {
  const { title, priority } = req.body;
  res.status(201).json(createTodo(title, priority ?? "Medium"));
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;
  res.status(200).json(checkTodo(id, completed));
});



export default router;