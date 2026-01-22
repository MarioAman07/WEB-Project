const express = require("express");
const fs = require("fs");
const path = require("path");
const { connectDB } = require('./database/connection'); // Импорт подключения к БД
const itemRoutes = require('./routes/itemRoutes'); // Импорт API маршрутов

const app = express();
const PORT = 3000;

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// Custom logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));
// Для вашего текущего сетапа (style.css в корне):
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

// Helper Navigation Function
 // Navigation HTML helper
function navHTML() {
  return `
    <nav style="display:flex; gap:14px; margin-bottom:16px;">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <a href="/search?q=tokyo">Search</a>
      <a href="/test" style="color: #ffbb33; font-weight:bold;">★ API Test Page</a> 
    </nav>
    <hr style="margin-bottom:16px;" />
  `;
}

// Template rendering function
function renderTemplate(res, fileName, replacements = {}, statusCode = 200) {
  const filePath = path.join(__dirname, 'views', fileName); 

  fs.readFile(filePath, 'utf-8', (err, html) => {
    if (err) return res.status(500).send('500 Server Error'); 

    let out = html;
    for (const [key, value] of Object.entries(replacements)) {
      out = out.replaceAll(`{{${key}}}`, String(value)); 
    }

    res.status(statusCode).send(out); 
  });
}

// ---------- API ROUTES (MongoDB) ----------
app.use('/api/items', itemRoutes);


// ---------- HTML PAGE ROUTES ----------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "test.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

app.get('/search', (req, res) => {
  const q = (req.query.q || '').trim(); 
  if (!q) return res.status(400).send('400 Bad Request: missing ?q='); 
  renderTemplate(res, 'search.html', { q }); 
});

app.get('/item/:id', (req, res) => {
  const id = (req.params.id || '').trim();
  renderTemplate(res, 'item.html', { id }); 
});

app.get("/api/info", (req, res) => {
  res.json({
    project: "Travel Planner",
    assignment: "Assignment 3 - Part 1 (MongoDB)",
    routes: ["/api/items", "/api/items/:id"], 
  });
});

// Contact POST
app.post("/contact", (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res
      .status(400)
      .send(`${navHTML()}<h2>400 Bad Request</h2><p>Please fill all fields.</p>`);
  }

  const newEntry = { name, email, message, date: new Date().toISOString() };
  const filePath = path.join(__dirname, "messages.json");

  fs.readFile(filePath, "utf-8", (readErr, data) => {
    let arr = [];
    if (!readErr && data && data.trim().length > 0) {
        try { arr = JSON.parse(data); } catch (_) { arr = []; }
    }
    arr.push(newEntry);

    fs.writeFile(filePath, JSON.stringify(arr, null, 2), (writeErr) => {
      if (writeErr) return res.status(500).send("Error saving message");
      
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

// Global 404 for API
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// Global 404 for Pages
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// ---------- START SERVER ----------
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

//aman dolbayeb