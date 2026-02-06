// server.js
require('dotenv').config(); // Load environment variables
const express = require("express");
const fs = require("fs");
const path = require("path"); // Подключение path должно быть до использования его функций
const { connectDB } = require('./database/connection');
const itemRoutes = require('./routes/itemRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); // Для v3 синтаксис
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Подключение модели User
const { body, validationResult } = require('express-validator'); // Для валидации в auth
const isAuthenticated = require('./middleware/auth'); // Подключаем middleware
const app = express();
const PORT = process.env.PORT || 3000;
// ---------- MIDDLEWARE ----------
app.use(cookieParser()); // Подключаем cookie parser
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey', // Берётся из .env
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: process.env.MONGO_URI + '/travelPlannerDB' }), // Фикс для v3.2.0: 'url' вместо 'mongoUrl', с dbName
  cookie: {
    httpOnly: true, // Защищает cookies от доступа через JavaScript
    secure: process.env.NODE_ENV === 'production', // Secure в prod
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));
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
// ---------- AUTHENTICATION MIDDLEWARE ----------
// Уже есть isAuthenticated в middleware/auth.js

// ---------- REGISTER ROUTE ----------
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.post('/register', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password min 6 chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User exists');
    const user = new User({ username, password }); // hash in pre-save
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Register error:', err); // Добавил log для дебаг
    res.status(500).send('Server error');
  }
});
// ---------- LOGIN ROUTE ----------
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.post('/login', [
  body('username').trim().notEmpty(),
  body('password').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials'); // Generic error
    }
    req.session.userId = user._id;
    res.status(200).send('Logged in');
  } catch (err) {
    console.error('Login error:', err); // Добавил log для дебаг
    res.status(500).send('Server error');
  }
});
// ---------- LOGOUT ROUTE ----------
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to log out');
    res.status(200).send('Logged out');
  });
});
// Check auth route for frontend
app.get('/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.userId });
});
// ---------- 404 ----------
app.use('/api', (req, res) => {
  res.status(404).json({ error: "API route not found" });
});
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// ---------- START SERVER ----------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});