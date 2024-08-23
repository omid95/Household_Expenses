const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('./src/Db/expanseSchema.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');

  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON');

  // Start a transaction
  db.run('BEGIN TRANSACTION', (err) => {
    if (err) {
      console.error('Error starting transaction:', err.message);
      return db.run('ROLLBACK');
    }

    // Insert tags
    const tags = ['Utilities', 'Groceries', 'Travel', 'Entertainment', 'Healthcare'];
    tags.forEach(tag => {
      db.run('INSERT INTO Tags (name) VALUES (?)', [tag], function(err) {
        if (err) {
          console.error('Error inserting tag:', err.message);
          return db.run('ROLLBACK');
        }
        console.log(`Inserted tag: ${tag} with ID: ${this.lastID}`);
      });
    });

    // Insert a random user
    db.run('INSERT INTO Users (username, email) VALUES (?, ?)', ['johndoe', 'john@example.com'], function(err) {
      if (err) {
        console.error('Error inserting user:', err.message);
        return db.run('ROLLBACK');
      }
      const userId = this.lastID;
      console.log(`Inserted user with ID: ${userId}`);

      // Insert 10 different expenses
      const expenses = [
        { amount: 50.00, date: '2024-08-23', description: 'Electricity bill' },
        { amount: 100.00, date: '2024-08-22', description: 'Grocery shopping' },
        { amount: 500.00, date: '2024-08-21', description: 'Flight tickets' },
        { amount: 30.00, date: '2024-08-20', description: 'Movie night' },
        { amount: 200.00, date: '2024-08-19', description: 'Doctor visit' },
        { amount: 75.00, date: '2024-08-18', description: 'Internet bill' },
        { amount: 60.00, date: '2024-08-17', description: 'Restaurant dinner' },
        { amount: 150.00, date: '2024-08-16', description: 'Hotel stay' },
        { amount: 40.00, date: '2024-08-15', description: 'Concert tickets' },
        { amount: 25.00, date: '2024-08-14', description: 'Pharmacy' }
      ];

      expenses.forEach((expense, index) => {
        db.run('INSERT INTO Expenses (user_id, amount, date, description) VALUES (?, ?, ?, ?)',
          [userId, expense.amount, expense.date, expense.description],
          function(err) {
            if (err) {
              console.error('Error inserting expense:', err.message);
              return db.run('ROLLBACK');
            }
            const expenseId = this.lastID;
            console.log(`Inserted expense with ID: ${expenseId}`);

            // Link expense to a tag
            const tagId = (index % 5) + 1; // This will cycle through tag IDs 1-5
            db.run('INSERT INTO ExpenseTags (expense_id, tag_id) VALUES (?, ?)',
              [expenseId, tagId],
              function(err) {
                if (err) {
                  console.error('Error linking expense to tag:', err.message);
                  return db.run('ROLLBACK');
                }
                console.log(`Linked expense ${expenseId} to tag ${tagId}`);
              }
            );
          }
        );
      });

      // Commit the transaction
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          return db.run('ROLLBACK');
        }
        console.log('Transaction committed successfully');
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
});
