const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  usernameExists = users.find((user) => user.username === username);

  if (!usernameExists) {
    const user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };

    users.push(user);

    return response.status(201).json(user);
  }

  return response.status(400).json({ error: "Username not available" });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const todo = {
    id: id,
    title: title,
    done: user.todos[todoIndex].done,
    deadline: deadline,
    created_at: user.todos[todoIndex].created_at,
  };

  user.todos[todoIndex] = todo;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const todo = {
    id: id,
    title: user.todos[todoIndex].title,
    done: true,
    deadline: user.todos[todoIndex].deadline,
    created_at: user.todos[todoIndex].created_at,
  };

  user.todos[todoIndex] = todo;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
