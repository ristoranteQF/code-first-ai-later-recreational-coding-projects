import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());


let todos: { id: number; title: string; done: boolean }[] = [];
let nextId = 1;

app.get("/todos", (_req, res) => res.json(todos));

app.post("/todos", (req, res) => {
  const todo = { id: nextId++, title: req.body.title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.sendStatus(404);
  Object.assign(todo, req.body);
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  todos = todos.filter(t => t.id !== Number(req.params.id));
  res.sendStatus(204);
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));