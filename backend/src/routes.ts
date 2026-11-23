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
  try {
    const cleared = clearCompleted();
    res.status(200).json(cleared);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.post("/recover-all", (_req, res) => {
  try {
    const recovered = recoverAll();
    res.status(200).json({ recovered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/delete-all", (_req, res) => {
  try {
    const deleted = deleteAll();
    res.status(200).json({ deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const changes = parseChanges(req.body);
  if (!changes) return res.status(400).json({ error: "invalid changes" });

  const todo = updateTodo(id, changes);
  if (!todo) return res.sendStatus(404);
  res.json(todo);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if(typeof id !== "number"){
    return res.status(400).json({error: "Invalid id, must be of type number."});
  }

  res.status(201).json(deleteTodoPermanently(id));
});

export default router;