const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/tasks", (req, res) => {
  const { title, category, dueDate, status, priority } = req.body; //extract data from the frontend request

  const sql = `
    INSERT INTO tasks (title, category, due_date, status, priority)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, category, dueDate, status, priority], (err, result) => { 
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Failed to add task" });
    }

    res.status(201).json({
      message: "Task added successfully",
      taskId: result.insertId,
    });
  });
});

app.get("/tasks", (req, res) => {
  const sql = `
    SELECT
      task_id,
      title,
      category,
      DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
      status,
      priority
    FROM tasks
    ORDER BY due_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }

    res.json(results);
  });
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, category, dueDate, status, priority } = req.body;

  const sql = `
    UPDATE tasks
    SET title = ?, category = ?, due_date = ?, status = ?, priority = ?
    WHERE task_id = ?
  `;

  db.query(sql, [title, category, dueDate, status, priority, id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "Failed to update task" });
    }

    res.json({ message: "Task updated successfully" });
  });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM tasks
    WHERE task_id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete task" });
    }

    res.json({ message: "Task deleted successfully" });
  });
});

app.get("/tasks/filter", (req, res) => {
  const { fromDate, toDate, status, priority } = req.query;

  let sql = `
    SELECT
      task_id,
      title,
      category,
      DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
      status,
      priority
    FROM tasks
    WHERE 1=1
  `;

  const values = [];

  if (fromDate) {
    sql += " AND due_date >= ?";
    values.push(fromDate);
  }

  if (toDate) {
    sql += " AND due_date <= ?";
    values.push(toDate);
  }

  if (status) {
    sql += " AND status = ?";
    values.push(status);
  }

  if (priority) {
    sql += " AND priority = ?";
    values.push(priority);
  }

  sql += " ORDER BY due_date ASC";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Filter error:", err);
      return res.status(500).json({ error: "Failed to filter tasks" });
    }

    res.json(results);
  });
});

app.get("/categories", (req, res) => {
  const sql = `
    SELECT name AS category
    FROM categories
    ORDER BY name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Category fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});