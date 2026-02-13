// server.js
require('dotenv').config();

const express = require("express");
const path = require("path");

const { connectDB } = require('./database/connection');
const itemRoutes = require('./routes/itemRoutes');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const User = require('./models/User');
const { body, validationResult } = require('express-validator');

const { attachUser, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  // ✅ IMPORTANT: MONGO_URI should already include DB name (/travelPlannerDB)
  store: new MongoStore({ url: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Important: after session, before routes
app.use(attachUser);

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// ---------- API ROUTES ----------
app.use('/api/items', itemRoutes);

// Info API
app.get("/api/info", (req, res) => {
  res.json({
    project: "Travel Planner",
    assignment: "Final Project",
    routes: [
      "/api/items",
      "/api/items/:id",
      "/register",
      "/login",
      "/logout",
      "/check-auth",
      "/admin",
      "/admin/promote",
      "/admin/demote"
    ]
  });
});

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

// ✅ Admin panel page (only admin)
app.get("/admin", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// ---------- AUTH: REGISTER ----------
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post('/register', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password min 6 chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User exists');

    const user = new User({ username, password }); // password hashed in pre-save
    await user.save();

    res.status(201).send('User registered');
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).send('Server error');
  }
});

// ---------- AUTH: LOGIN ----------
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post('/login', [
  body('username').trim().notEmpty(),
  body('password').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.userId = user._id;
    res.status(200).send('Logged in');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// ---------- AUTH: LOGOUT ----------
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to log out');
    res.status(200).send('Logged out');
  });
});

// Frontend auth check
app.get('/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.userId });
});

// ---------- ADMIN: PROMOTE ----------
app.post('/admin/promote', requireAdmin, [
  body('username').trim().notEmpty().withMessage('Username required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { role: 'admin' } },
      { new: true }
    ).select('username role');

    if (!user) return res.status(404).send('User not found');
    res.json({ message: 'Promoted', user });
  } catch (e) {
    console.error('Promote error:', e);
    res.status(500).send('Server error');
  }
});

// ---------- ADMIN: DEMOTE ----------
app.post('/admin/demote', requireAdmin, [
  body('username').trim().notEmpty().withMessage('Username required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username } = req.body;

  try {
    // Prevent demoting yourself (avoid lock-out)
    const me = req.user || await User.findById(req.session.userId).select('username role');
    if (me && me.username === username) {
      return res.status(400).send("You cannot demote yourself");
    }

    const target = await User.findOne({ username }).select('username role');
    if (!target) return res.status(404).send('User not found');

    // Prevent removing the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (target.role === 'admin' && adminCount <= 1) {
      return res.status(400).send("Cannot demote the last admin");
    }

    const updated = await User.findOneAndUpdate(
      { username },
      { $set: { role: 'user' } },
      { new: true }
    ).select('username role');

    res.json({ message: 'Demoted', user: updated });
  } catch (e) {
    console.error('Demote error:', e);
    res.status(500).send('Server error');
  }
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

// ---------- ENSURE ADMIN ----------
async function ensureAdmin() {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;

  if (!u || !p) {
    console.log("ADMIN_USERNAME/ADMIN_PASSWORD not set in .env, skipping ensureAdmin()");
    return;
  }

  let admin = await User.findOne({ username: u });

  if (!admin) {
    admin = new User({ username: u, password: p, role: 'admin' });
    await admin.save();
    console.log(`Admin created: ${u}`);
    return;
  }

  if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log(`Admin role updated for: ${u}`);
  }
}

// ---------- START SERVER ----------
connectDB().then(async () => {
  await ensureAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
