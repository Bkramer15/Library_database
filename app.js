const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// View Engine Setup (assuming Handlebars)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'xwlsfQL@6',
  database: 'library_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the MySQL connection for each table
const testConnection = (table) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`Error connecting to ${table} table:`, err);
      return;
    }

    connection.query(`SELECT * FROM ${table}`, (err, results, fields) => {
      connection.release(); // Release the connection

      if (err) {
        console.error(`Error querying ${table} table:`, err);
        return;
      }

      console.log(`Initial query results for ${table} table:`, results);
    });
  });
};

// Test connections for each table
testConnection('employees');
testConnection('books');
testConnection('categories');
testConnection('book_checkout');
testConnection('users');
testConnection('jobs');

// Close the connection pool gracefully on server shutdown
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      return console.error('Error closing the database pool connections', err.message);
    }
    console.log('Database pool connections closed');
    process.exit(0);
  });
});

// Routes

// Employees table

// GET method to retrieve all employees or filter by search term
app.get('/employees', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all employees
    pool.query('SELECT * FROM employees', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('employees', { employees: results }); // Assuming 'index.hbs' is your Handlebars template
    });
  } else {
    // Query the database based on the search input (assuming name is the column name)
    pool.query('SELECT * FROM employees WHERE employee_id LIKE ?', [`%${search}%`], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('employees', { employees: results }); 
    });
  }
});

// POST method to create a new employee
app.post('/employees', (req, res) => {
  const { firstName, lastName, HireDate, Job_id, Phone_number } = req.body;

  // Validate input (for example, check if all required fields are present)

  // Insert new employee into the employees table
  pool.query('INSERT INTO employees (firstName, lastName, HireDate, Job_id, Phone_number) VALUES (?, ?, ?, ?, ?)', 
    [firstName, lastName, HireDate, Job_id, Phone_number],
    (err, results) => {
      if (err) {
        console.error('Error registering employee:', err);
        res.status(500).send('Error registering employee');
        return;
      }
      res.status(200).send('Employee registered successfully');
    }
  );
});

// PUT method to update an employee by employee_id
app.put('/employees/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { firstName, lastName, HireDate, Job_id, Phone_number } = req.body;

  // Update employee in the employees table
  pool.query(
    'UPDATE employees SET firstName = ?, lastName = ?, HireDate = ?, Job_id = ?, Phone_number = ? WHERE employee_id = ?',
    [firstName, lastName, HireDate, Job_id, Phone_number, employee_id],
    (err, results) => {
      if (err) {
        console.error('Error updating employee:', err);
        res.status(500).send('Error updating employee');
        return;
      }
      res.status(200).send('Employee updated successfully');
    }
  );
});

// DELETE method to delete an employee by employee_id
app.delete('/employees/:employee_id', (req, res) => {
  const { employee_id } = req.params;

  // Delete employee from the employees table
  pool.query('DELETE FROM employees WHERE employee_id = ?', [employee_id], (err, results) => {
    if (err) {
      console.error('Error deleting employee:', err);
      res.status(500).send('Error deleting employee');
      return;
    }
    res.status(200).send('Employee deleted successfully');
  });
});

// Books table

// GET method to retrieve all books or filter by search term
app.get('/books', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all books
    pool.query('SELECT * FROM books', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('books', { books: results }); // Assuming 'index.hbs' is your Handlebars template
    });
  } else {
    // Query the database based on the search input (assuming title is the column name)
    pool.query('SELECT * FROM books WHERE book_id LIKE ?', [`%${search}%`], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('books', { books: results }); // Assuming 'index.hbs' is your Handlebars template
    });
  }
});

// POST method to create a new book
app.post('/books', (req, res) => {
  const { book_id, title,  category_id, author_id } = req.body;

  // Insert new book into the books table
  pool.query('INSERT INTO books (book_id, title category_id, author_id) VALUES (?, ?, ?)', [title, category_id, author_id], (err, results) => {
    if (err) {
      console.error('Error registering book:', err);
      res.status(500).send('Error registering book');
      return;
    }
    res.status(200).send('Book registered successfully');
  });
});

// PUT method to update a book by book_id
app.put('/books/:book_id', (req, res) => {
  const { book_id } = req.params;
  const { new_book_id, new_title, new_category_id, new_author_id } = req.body;

  // Update book in the books table
  pool.query('UPDATE books SET book_id = ?, title = ?, category_id = ?, author_id = ? WHERE book_id = ?', [new_book_id, new_title, new_category_id, new_author_id, book_id], (err, results) => {
    if (err) {
      console.error('Error updating book:', err);
      res.status(500).send('Error updating book');
      return;
    }
    res.status(200).send('Book updated successfully');
  });
});

// DELETE method to delete a book by book_id
app.delete('/books/:book_id', (req, res) => {
  const { book_id } = req.params;

  // Delete book from the books table
  pool.query('DELETE FROM books WHERE book_id = ?', [book_id], (err, results) => {
    if (err) {
      console.error('Error deleting book:', err);
      res.status(500).send('Error deleting book');
      return;
    }
    res.status(200).send('Book deleted successfully');
  });
});

// Categories table

// GET method to retrieve all categories or filter by search term
app.get('/categories', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all categories
    pool.query('SELECT * FROM categories', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('categories', { categories: results }); //categories.hbs is the hbs tempalate
    });
  } else {
    // Query the database based on the search input (assuming category_ID is the column name)
    pool.query('SELECT * FROM categories WHERE category_ID LIKE ?', [`%${search}%`], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('categories', { categories: results }); // categiries.hbs is the hbs tempalate
    });
  }
});

// POST method to create a new category
app.post('/categories', (req, res) => {
  const { category_name } = req.body;

  // Insert new category into the categories table
  pool.query('INSERT INTO categories (category_name) VALUES (?)', [category_name], (err, results) => {
    if (err) {
      console.error('Error registering category:', err);
      res.status(500).send('Error registering category');
      return;
    }
    res.status(200).send('Category registered successfully');
  });
});

// PUT method to update a category by category_ID
app.put('/categories/:category_ID', (req, res) => {
  const { category_ID } = req.params;
  const { category_name } = req.body;

  // Update category in the categories table
  pool.query('UPDATE categories SET category_name = ? WHERE category_ID = ?', [category_name, category_ID], (err, results) => {
    if (err) {
      console.error('Error updating category:', err);
      res.status(500).send('Error updating category');
      return;
    }
    res.status(200).send('Category updated successfully');
  });
});

// DELETE method to delete a category by category_ID
app.delete('/categories/:category_ID', (req, res) => {
  const { category_ID } = req.params;

  // Delete category from the categories table
  pool.query('DELETE FROM categories WHERE category_ID = ?', [category_ID], (err, results) => {
    if (err) {
      console.error('Error deleting category:', err);
      res.status(500).send('Error deleting category');
      return;
    }
    res.status(200).send('Category deleted successfully');
  });
});

// Book_checkout table

// GET method to retrieve all checkouts or filter by search term
app.get('/book_checkout', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all checkouts
    pool.query('SELECT * FROM book_checkout', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('book_checkout', { book_checkout: results }); //book_checkout is the Handlebars template
    });
  } else {
    // Query the database based on the search input (assuming checkout_id is the column name)
    pool.query('SELECT * FROM book_checkout WHERE checkout_id LIKE ?', [`%${search}%`], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('books_checkout', { book_checkout: results }); // book_checkouts is the Handlebars template
    });
  }
});

// POST method to create a new book checkout
app.post('/book_checkout', (req, res) => {
  const { checkout_date, return_date, status, book_id, user_id } = req.body;

  // Insert new checkout into the book_checkout table
  pool.query('INSERT INTO book_checkout (checkout_date, return_date, status, book_id, user_id) VALUES (?, ?, ?, ?, ?)', 
    [checkout_date, return_date, status, book_id, user_id],
    (err, results) => {
      if (err) {
        console.error('Error registering checkout:', err);
        res.status(500).send('Error registering checkout');
        return;
      }
      res.status(200).send('Checkout registered successfully');
    }
  );
});

// PUT method to update a book checkout by checkout_id
app.put('/book_checkout/:checkout_id', (req, res) => {
  const { checkout_id } = req.params;
  const { checkout_date, return_date, status, book_id, user_id } = req.body;

  // Update checkout in the book_checkout table
  pool.query(
    'UPDATE book_checkout SET checkout_date = ?, return_date = ?, book_id = ?, user_id = ? WHERE book_id = ?',
    [checkout_date, return_date, book_id, user_id,],
    (err, results) => {
      if (err) {
        console.error('Error updating checkout:', err);
        res.status(500).send('Error updating checkout');
        return;
      }
      res.status(200).send('Checkout updated successfully');
    }
  );
});

// DELETE method to delete a book checkout by checkout_id
app.delete('/book_checkout/:checkout_id', (req, res) => {
  const { book_id } = req.params;

  // Delete checkout from the book_checkout table
  pool.query('DELETE FROM book_checkout WHERE book_id = ?', [book_id], (err, _results) => {
    if (err) {
      console.error('Error deleting checkout:', err);
      res.status(500).send('Error deleting checkout');
      return;
    }
    res.status(200).send('Checkout deleted successfully');
  });
});

// Users table

// GET method to retrieve all users or filter by search term
app.get('/users', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all users
    pool.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('users', { users: results }); // user.hbs is the Handlebars template
    });
  } else {
    // Query the database based on the search input (assuming username is the column name)
    pool.query('SELECT * FROM users WHERE user_id LIKE ?', [`%${search}%`], (err, _results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('users', { users: results }); // users.hbs is the Handlebars template
    });
  }
});

// POST method to create a new user
app.post('/users', (req, res) => {
  const {user_id,firstName,lastName,fines,age } = req.body;

  // Insert new user into the users table
  pool.query('INSERT INTO users (user_id,firstName,lastName,fines,age) VALUES (?, ?, ?,?,?)', [user_id,firstName,lastName,fines,age], (err, results) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).send('Error registering user');
      return;
    }
    res.status(200).send('User registered successfully');
  });
});

// PUT method to update a user by user_id
app.put('/users/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { username,firstName,lastName,fines,age } = req.body;

  // Update user in the users table
  pool.query(
    'UPDATE users SET username = ?, firstName = ?, lastName = ?, fines = ?, age = ?,  WHERE user_id = ?',
    [user_id,firstName,lastName,fines,age],
    (err, results) => {
      if (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Error updating user');
        return;
      }
      res.status(200).send('User updated successfully');
    }
  );
});

// DELETE method to delete a user by user_id
app.delete('/users/:user_id', (req, res) => {
  const { user_id } = req.params;

  // Delete user from the users table
  pool.query('DELETE FROM users WHERE user_id = ?', [user_id], (err, _results) => {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user');
      return;
    }
    res.status(200).send('User deleted successfully');
  });
});

// Jobs table

// GET method to retrieve all jobs or filter by search term
app.get('/jobs', (req, res) => {
  const { search } = req.query;

  if (!search) {
    // If no search parameter is provided, retrieve all jobs
    pool.query('SELECT * FROM jobs', (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('jobs', { jobs: results }); //jobs.hbs is the  Handlebars template
    });
  } else {
    // Query the database based on the search input (assuming job_title is the column name)
    pool.query('SELECT * FROM jobs WHERE job_id LIKE ?', [`%${search}%`], (err, _results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.render('jobs', { jobs: results }); // jobs.hbs is the Handlebars template
    });
  }
});

// POST method to create a new job
app.post('/jobs', (req, res) => {
  const { job_title } = req.body;

  // Insert new job into the jobs table
  pool.query('INSERT INTO jobs (job_id) VALUES (?)', [job_id], (err, _results) => {
    if (err) {
      console.error('Error registering job:', err);
      res.status(500).send('Error registering job');
      return;
    }
    res.status(200).send('Job registered successfully');
  });
});

// PUT method to update a job by job_id
app.put('/jobs/:job_id', (req, res) => {
  const { job_id } = req.params;
  const {employee_id } = req.body;

  // Update job in the jobs table
  pool.query('UPDATE jobs SET job_title = ? WHERE job_id = ?', [employee_id, job_id], (err, _results) => {
    if (err) {
      console.error('Error updating job:', err);
      res.status(500).send('Error updating job');
      return;
    }
    res.status(200).send('Job updated successfully');
  });
});

// DELETE method to delete a job by job_id
app.delete('/jobs/:job_id', (req, res) => {
  const { job_id } = req.params;

  // Delete job from the jobs table
  pool.query('DELETE FROM jobs WHERE job_id = ?', [job_id], (err, _results) => {
    if (err) {
      console.error('Error deleting job:', err);
      res.status(500).send('Error deleting job');
      return;
    }
    res.status(200).send('Job deleted successfully');
  });
});


// Start the server
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log(`Server listening on PORT ${PORT}`);
});