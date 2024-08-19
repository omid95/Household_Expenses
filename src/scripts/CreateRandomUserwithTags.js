const sqlite3 = require('sqlite3'); // Import the sqlite3 module
const debug = require('debug')('app:database'); // Import the debug module and create a debug namespace

const dbPath = './src/Db/expanseSchema.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Step 1: Insert 5 tags into the Tags table
  const tags = ['Groceries', 'Utilities', 'Entertainment', 'Travel', 'Dining'];
  tags.forEach(tag => {
    db.run(`
      INSERT INTO Tags (name) VALUES (?)
    `, [tag], function(err) {
      if (err) {
        debug('Error inserting tag:', err.message);
      } else {
        debug('Inserted tag:', tag);
      }
    });
  });

  // Step 2: Insert one user into the Users table
  db.run(`
    INSERT INTO Users (username, email) VALUES (?, ?)
  `, ['Omid Yousefian', 'omid@example.com'], function(err) {
    if (err) {
      debug('Error inserting user:', err.message);
    } else {
      debug('Inserted user: Omid Yousefian');
    }
  });

  // Step 3: Insert 12 expenses on different days, 5 of which have unique tags
  const userId = 1; // Assuming the user_id of Omid Yousefian is 1
  const expenses = [
    { amount: 5000, date: '2024-08-01', description: 'Grocery shopping', tags: ['Groceries'] },
    { amount: 2000, date: '2024-08-02', description: 'Electricity bill', tags: ['Utilities'] },
    { amount: 8000, date: '2024-08-03', description: 'Movie tickets', tags: ['Entertainment'] },
    { amount: 15000, date: '2024-08-04', description: 'Weekend trip', tags: ['Travel'] },
    { amount: 4000, date: '2024-08-05', description: 'Dining out', tags: ['Dining'] },
    { amount: 3000, date: '2024-08-06', description: 'Gas refill', tags: [] },
    { amount: 2500, date: '2024-08-07', description: 'Internet bill', tags: ['Utilities'] },
    { amount: 10000, date: '2024-08-08', description: 'Concert tickets', tags: ['Entertainment'] },
    { amount: 7000, date: '2024-08-09', description: 'Grocery shopping', tags: ['Groceries'] },
    { amount: 12000, date: '2024-08-10', description: 'Flight tickets', tags: ['Travel'] },
    { amount: 5000, date: '2024-08-11', description: 'Restaurant dinner', tags: ['Dining'] },
    { amount: 6000, date: '2024-08-12', description: 'Streaming service', tags: ['Entertainment'] }
  ];

  expenses.forEach((expense, index) => {
    db.run(`
      INSERT INTO Expenses (user_id, amount, date, description) VALUES (?, ?, ?, ?)
    `, [userId, expense.amount, expense.date, expense.description], function(err) {
      if (err) {
        debug('Error inserting expense:', err.message);
      } else {
        const expenseId = this.lastID;
        debug('Inserted expense:', expense.description);

        // Step 4: Link the expense with its tags in the ExpenseTags table
        expense.tags.forEach(tagName => {
          db.get(`
            SELECT tag_id FROM Tags WHERE name = ?
          `, [tagName], (err, row) => {
            if (err) {
              debug('Error fetching tag_id:', err.message);
            } else if (row) {
              db.run(`
                INSERT INTO ExpenseTags (expense_id, tag_id) VALUES (?, ?)
              `, [expenseId, row.tag_id], function(err) {
                if (err) {
                  debug('Error linking expense with tag:', err.message);
                } else {
                  debug('Linked expense', expense.description, 'with tag', tagName);
                }
              });
            }
          });
        });
      }
    });
  });
});

db.close();
