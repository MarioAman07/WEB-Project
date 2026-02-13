// middleware/auth.js
const Destination = require('../models/Destination');
const User = require('../models/User');

async function isAuthenticated(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized: Please log in');
  next();
}

// load role into request (optional helper)
async function attachUser(req, res, next) {
  if (!req.session.userId) return next();
  try {
    req.user = await User.findById(req.session.userId).select('username role');
  } catch (e) {}
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized');
  const user = req.user || await User.findById(req.session.userId).select('role');
  if (!user) return res.status(401).send('Unauthorized');
  if (user.role !== 'admin') return res.status(403).send('Forbidden: Admin only');
  next();
}

// Owner access for Destination routes: user can modify only own data, admin can modify all
async function requireOwnerOrAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized');

  const user = req.user || await User.findById(req.session.userId).select('role');
  if (!user) return res.status(401).send('Unauthorized');

  // Admin bypass
  if (user.role === 'admin') return next();

  // For user: must own this destination
  const id = req.params.id;
  const item = await Destination.findById(id).select('ownerId');
  if (!item) return res.status(404).json({ error: 'Not found' });

  if (String(item.ownerId) !== String(req.session.userId)) {
    return res.status(403).send('Forbidden: You can modify only your own records');
  }

  next();
}

module.exports = { isAuthenticated, requireAdmin, requireOwnerOrAdmin, attachUser };
