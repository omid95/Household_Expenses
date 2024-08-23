const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('./src/Db/expanseSchema.db');

function initializeDatabase() {
  console.log('Attempting to create database at:', dbPath);

  // Check if the database file already exists
  if (fs.existsSync(dbPath)) {
    console.log('Database file already exists at:', dbPath);
    return;
  }

  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log('Creating directory:', dbDir);
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err.message);
      process.exit(1);
    }
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the database.');

    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');

      // Start a transaction
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Error starting transaction:', err.message);
          return db.run('ROLLBACK');
        }

        // Create tables
        createTables(db, () => {
          // Commit the transaction
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err.message);
              return db.run('ROLLBACK');
            }

            // Create indexes
            createIndexes(db, () => {
              // Optimize the database
              optimizeDatabase(db, () => {
                // Close the database connection
                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', err.message);
                  } else {
                    console.log('Database connection closed.');
                  }

                  // Final check
                  if (fs.existsSync(dbPath)) {
                    console.log('Final check: Database file exists at:', dbPath);
                  } else {
                    console.error('Final check: Database file does NOT exist at:', dbPath);
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

function createTables(db, callback) {
  const queries = [
    {
      sql: `CREATE TABLE IF NOT EXISTS Users (
              user_id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              email TEXT NOT NULL UNIQUE,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
      message: 'Users table created successfully',
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS Expenses (
              expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              amount REAL NOT NULL,
              date TEXT NOT NULL,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
            )`,
      message: 'Expenses table created successfully',
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS Tags (
              tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE
            )`,
      message: 'Tags table created successfully',
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS ExpenseTags (
              expense_id INTEGER NOT NULL,
              tag_id INTEGER NOT NULL,
              PRIMARY KEY (expense_id, tag_id),
              FOREIGN KEY (expense_id) REFERENCES Expenses(expense_id) ON DELETE CASCADE,
              FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
            )`,
      message: 'ExpenseTags table created successfully',
    }
  ];

  let completedQueries = 0;

  queries.forEach(({ sql, message }) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`Error running query: ${sql}`, err.message);
        return db.run('ROLLBACK');
      }
      console.log(message);
      completedQueries += 1;
      if (completedQueries === queries.length) {
        callback();
      }
    });
  });
}

function createIndexes(db, callback) {
  const queries = [
    {
      sql: 'CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON Expenses(user_id)',
      message: 'Index on Expenses(user_id) created successfully',
    },
    {
      sql: 'CREATE INDEX IF NOT EXISTS idx_expenses_date ON Expenses(date)',
      message: 'Index on Expenses(date) created successfully',
    },
    {
      sql: 'CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON Expenses(user_id, date)',
      message: 'Index on Expenses(user_id, date) created successfully',
    },
    {
      sql: 'CREATE INDEX IF NOT EXISTS idx_expensetags_expense_id ON ExpenseTags(expense_id)',
      message: 'Index on ExpenseTags(expense_id) created successfully',
    },
    {
      sql: 'CREATE INDEX IF NOT EXISTS idx_expensetags_tag_id ON ExpenseTags(tag_id)',
      message: 'Index on ExpenseTags(tag_id) created successfully',
    }
  ];

  let completedQueries = 0;

  queries.forEach(({ sql, message }) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`Error running query: ${sql}`, err.message);
        return db.run('ROLLBACK');
      }
      console.log(message);
      completedQueries += 1;
      if (completedQueries === queries.length) {
        callback();
      }
    });
  });
}

function optimizeDatabase(db, callback) {
  db.serialize(() => {
    db.run('PRAGMA synchronous = NORMAL', (err) => {
      if (err) {
        console.error('Error setting PRAGMA synchronous:', err.message);
        return callback();
      }

      db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) {
          console.error('Error setting PRAGMA journal_mode:', err.message);
          return callback();
        }

        db.run('VACUUM', (err) => {
          if (err) {
            console.error('Error running VACUUM:', err.message);
          } else {
            console.log('VACUUM completed successfully');
          }
          callback();
        });
      });
    });
  });
}


initializeDatabase();

// Set a timeout to check if the file exists after all operations
setTimeout(() => {
  if (fs.existsSync(dbPath)) {
    console.log('Timeout check: Database file exists at:', dbPath);
  } else {
    console.error('Timeout check: Database file does NOT exist at:', dbPath);
  }
}, 2000); // Check after 2 seconds
