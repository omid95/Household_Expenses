const sqlite3 = require('sqlite3'); // Import the sqlite3 module
const debug = require('debug')('app:database'); // Import the debug module and create a debug namespace

const dbPath = './src/Db/expanseSchema.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS Expenses (
      expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL, -- Stored in cents to avoid floating-point precision issues
      date TEXT NOT NULL, -- Store dates as 'YYYY-MM-DD' format strings
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )
  `);

  // Tags table 
  db.run(`
    CREATE TABLE IF NOT EXISTS Tags (
      tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // Table to store many-to-many relationship between expenses and tags
  db.run(`
    CREATE TABLE IF NOT EXISTS ExpenseTags (
      expense_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (expense_id, tag_id),
      FOREIGN KEY (expense_id) REFERENCES Expenses(expense_id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
    )
  `);

  // Indexes for faster querying
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON Expenses(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON Expenses(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON Expenses(user_id, date)`); // Composite index for user_id and date
  db.run(`CREATE INDEX IF NOT EXISTS idx_expensetags_expense_id ON ExpenseTags(expense_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expensetags_tag_id ON ExpenseTags(tag_id)`);
});

db.close();
