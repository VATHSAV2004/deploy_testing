const express = require('express');
const sqlite = require('sqlite'); // Import sqlite package
const sqlite3 = require('sqlite3'); // Import sqlite3 driver
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Open the SQLite database (or create it if it doesn't exist)
let db;

// Open the database asynchronously
async function openDb() {
    try {
        db = await sqlite.open({
            filename: './todoapp.db',
            driver: sqlite3.Database // Use sqlite3.Database for compatibility with SQLite3
        });
        console.log("Connected to SQLite database!");
        // Create the todos table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE
            )
        `);
    } catch (err) {
        console.error("Failed to open database:", err);
    }
}

// Call openDb to initialize the database connection
openDb();

// Get all todos
app.get('/todos', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM todos");
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error retrieving todos");
    }
});

// Add a new todo
app.post('/todos', async (req, res) => {
    const { task } = req.body;
    try {
        const result = await db.run("INSERT INTO todos (task) VALUES (?)", [task]);
        res.json({ id: result.lastID, task, completed: false });
    } catch (err) {
        res.status(500).send("Error adding todo");
    }
});

// Update a todo (mark as completed)
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        await db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id]);
        res.json({ message: "Todo updated" });
    } catch (err) {
        res.status(500).send("Error updating todo");
    }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM todos WHERE id = ?", [id]);
        res.json({ message: "Todo deleted" });
    } catch (err) {
        res.status(500).send("Error deleting todo");
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
