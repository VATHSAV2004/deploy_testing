const express = require('express');
const sqlite3 = require('sqlite3').verbose();  // Import SQLite3
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Open the SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./todoapp.db', (err) => {
    if (err) {
        console.error("Failed to open database:", err);
    } else {
        console.log("Connected to SQLite database!");
    }
});

// Create the todos table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err);
    }
});

// Get all todos
app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", (err, rows) => {
        if (err) {
            res.status(500).send("Error retrieving todos");
            return;
        }
        res.json(rows);
    });
});

// Add a new todo
app.post('/todos', (req, res) => {
    const { task } = req.body;
    const stmt = db.prepare("INSERT INTO todos (task) VALUES (?)");
    stmt.run(task, function (err) {
        if (err) {
            res.status(500).send("Error adding todo");
            return;
        }
        res.json({ id: this.lastID, task, completed: false });
    });
    stmt.finalize();
});

// Update a todo (mark as completed)
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const stmt = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
    stmt.run(completed, id, (err) => {
        if (err) {
            res.status(500).send("Error updating todo");
            return;
        }
        res.json({ message: "Todo updated" });
    });
    stmt.finalize();
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
    stmt.run(id, (err) => {
        if (err) {
            res.status(500).send("Error deleting todo");
            return;
        }
        res.json({ message: "Todo deleted" });
    });
    stmt.finalize();
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
