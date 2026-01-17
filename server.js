const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose(); // Connecting SQLite for database

const app = express();
const PORT = 3000;

// 2 Connecting to the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message); // Logs if there's an error
  } else {
    console.log("Connected to the SQLite database successfully."); // Logs if the connection is successful
  }
});

// Creating the 'items' table if it doesn't exist yet (with fields: id, title, description)
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, title TEXT, description TEXT)");
});

// Template rendering function (used to send HTML files with dynamic content)
function renderTemplate(res, fileName, replacements = {}, statusCode = 200) {
  const filePath = path.join(__dirname, 'views', fileName); // Building file path

  fs.readFile(filePath, 'utf-8', (err, html) => {
    if (err) return res.status(500).send('500 Server Error'); // Handles errors if file read fails

    let out = html;
    for (const [key, value] of Object.entries(replacements)) {
      out = out.replaceAll(`{{${key}}}`, String(value)); // Replaces dynamic placeholders in the HTML file with actual values
    }

    res.status(statusCode).send(out); // Sends the rendered HTML back to the client
  });
}

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded data (from forms)
app.use(express.json()); // Middleware for parsing JSON data in API requests

// Custom logger middleware: logs HTTP method and URL of the incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Logs the HTTP method and URL
  next(); // Passes the request to the next middleware or route handler
});

// Static file serving (serving files like images, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Navigation HTML helper: used to generate navigation bar on all pages
function navHTML() {
  return `
    <nav style="display:flex; gap:14px; margin-bottom:16px;">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <a href="/search?q=tokyo">Search</a>
      <a href="/item/1">Item</a>
      <a href="/api/info">API Info</a>
    </nav>
    <hr style="margin-bottom:16px;" />
  `;
}

// ---------- PAGES ----------
// Routes for serving HTML pages

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

// ---------- REQUIRED ROUTES ----------

// Search route: accepts search query and renders the search results page
app.get('/search', (req, res) => {
  const q = (req.query.q || '').trim(); // Getting the query parameter from the URL
  if (!q) return res.status(400).send('400 Bad Request: missing ?q='); // Error if the query is missing
  renderTemplate(res, 'search.html', { q }); // Renders the search page with the query value
});

// Route to fetch a single item by ID
app.get('/item/:id', (req, res) => {
  const id = (req.params.id || '').trim(); // Fetching item ID from the route parameter
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).send('400 Bad Request: id must be a number'); // Error if ID is not a valid number
  }
  renderTemplate(res, 'item.html', { id }); // Renders the item page with the item ID
});

// API endpoint to return project information and available routes
app.get("/api/info", (req, res) => {
  res.json({
    project: "Travel Planner", // Information about the project
    assignment: "Assignment 2 - Part 1", // Assignment name
    routes: ["/", "/about", "/contact (GET/POST)", "/search?q=", "/item/:id", "/api/info"], // List of available routes
  });
});

// Contact POST: validate + save with fs.writeFile()
app.post("/contact", (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res
      .status(400)
      .send(`${navHTML()}<h2>400 Bad Request</h2><p>Please fill <b>name</b>, <b>email</b>, and <b>message</b>.</p>`);
  }

  const newEntry = {
    name,
    email,
    message,
    date: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "messages.json");

  fs.readFile(filePath, "utf-8", (readErr, data) => {
    let arr = [];

    // Support both formats:
    // 1) JSON array   2) NDJSON (each line is JSON)
    if (!readErr && data && data.trim().length > 0) {
      const trimmed = data.trim();

      if (trimmed.startsWith("[")) {
        try {
          arr = JSON.parse(trimmed);
          if (!Array.isArray(arr)) arr = [];
        } catch (_) {
          arr = [];
        }
      } else {
        // NDJSON -> array
        const lines = trimmed.split("\n").filter(Boolean);
        arr = lines
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (_) {
              return null;
            }
          })
          .filter(Boolean);
      }
    }

    arr.push(newEntry);

    fs.writeFile(filePath, JSON.stringify(arr, null, 2), (writeErr) => {
      if (writeErr) {
        return res
          .status(500)
          .send(`${navHTML()}<h2>500 Server Error</h2><p>Could not save your message.</p>`);
      }

      res.send(`${navHTML()}
        <div style="font-family: Arial; text-align: center; margin-top: 40px; color: #00344a;">
          <h2>Thanks, ${name}!</h2>
          <p>Your message has been saved.</p>
          <a href="/" style="color:#00344a; font-weight:bold;">Back to Home</a>
        </div>
      `);
    });
  });
});

// ---------- CRUD API Routes ----------

// 2 GET all items from the database
app.get("/api/items", (req, res) => {
  db.all("SELECT * FROM items ORDER BY id ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Error handling for database query
    }
    res.json(rows); // Returns all items as a JSON response
  });
});

// GET a specific item by its ID
app.get("/api/items/:id", (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" }); // Error if ID is not a number
  }

  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Error handling for database query
    }
    if (!row) {
      return res.status(404).json({ error: "Item not found" }); // Error if item with given ID is not found
    }
    res.json(row); // Returns the item as a JSON response
  });
});

// POST new item into the database
app.post("/api/items", (req, res) => {
  const { title, description } = req.body; // Getting title and description from the request body
  if (!title || !description) {
    return res.status(400).json({ error: "Missing required fields: title, description" }); // Error if required fields are missing
  }

  db.run("INSERT INTO items (title, description) VALUES (?, ?)", [title, description], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Error handling for database query
    }
    res.status(201).json({ id: this.lastID, title, description }); // Returns the newly created item with its ID
  });
});

// PUT (update) an existing item in the database by its ID
app.put("/api/items/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body; // Getting updated title and description from the request body

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" }); // Error if ID is not a number
  }

  if (!title || !description) {
    return res.status(400).json({ error: "Missing required fields: title, description" }); // Error if required fields are missing
  }

  db.run("UPDATE items SET title = ?, description = ? WHERE id = ?", [title, description, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Error handling for database query
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" }); // Error if the item to update was not found
    }
    res.json({ id, title, description }); // Returns the updated item
  });
});

// DELETE an item by its ID
app.delete("/api/items/:id", (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" }); // Error if ID is not a number
  }

  db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message }); // Error handling for database query
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" }); // Error if the item to delete was not found
    }
    res.status(200).json({ message: "Item deleted successfully" }); // Success message for deletion
  });
});

// 404 Handler for undefined routes (for API and regular pages)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: "Not Found" }); // Returns 404 for undefined API routes
  }
  res.status(404).sendFile(path.join(__dirname, "views", "404.html")); // Returns a 404 HTML page for unknown regular routes
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Logs server start message
});
