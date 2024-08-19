const express = require('express');
const cors = require('cors'); // Import the CORS package
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 5000;
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With,Cache-Control,X-CSRF-Token'
}));


const path = require('path');
const dbPath = path.resolve('C:/React-angular/React/hello-world/src/Db/expanseSchema.db');
const db = new sqlite3.Database(dbPath);
console.log('Database connected:', db);
// API endpoint to get expenses
app.get('/api/expenses', (req, res) => {
    const userId = req.query.userId;

    db.all('SELECT * FROM Expenses WHERE user_Id = ?', [userId], (err, rows) => {
                          //Expenses
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API endpoint to get expenses by category
app.get('/api/expenses/categories', (req, res) => {
    const userId = req.query.userId;
    const sql = `
        SELECT t.name as category, SUM(e.amount) as total
        FROM Expenses e
        JOIN ExpenseTags et ON e.expense_id = et.expense_id
        JOIN Tags t ON et.tag_id = t.tag_id
        WHERE e.user_id = ?
        GROUP BY t.name
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


// API endpoint to get monthly expenses
app.get('/api/expenses/monthly', (req, res) => {
    const userId = req.query.userId;
    const sql = `
        SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
        FROM Expenses
        WHERE user_id = ?
        GROUP BY month
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
