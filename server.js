require('dotenv').config(); // Load environment variables

const express = require("express");
const fs = require("fs");
const path = require("path");
const { connectDB } = require('./database/connection');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// ---------- API ROUTES ----------
app.use('/api/items', itemRoutes);

// ---------- HTML ROUTES ----------
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

app.get("/search", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).send("400 Bad Request: missing ?q=");
  res.sendFile(path.join(__dirname, "views", "search.html"));
});

app.get("/item/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "item.html"));
});

// Info API
app.get("/api/info", (req, res) => {
  res.json({
    project: "Travel Planner",
    assignment: "Assignment 3 - MongoDB",
    routes: ["/api/items", "/api/items/:id"]
  });
});

// ---------- 404 ----------
app.use('/api', (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// ---------- START SERVER ----------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});