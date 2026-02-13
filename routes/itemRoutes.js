// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { body, validationResult } = require('express-validator');
const { isAuthenticated, requireOwnerOrAdmin } = require('../middleware/auth');

// GET ALL (оставляем как есть)
router.get('/', async (req, res) => {
  try {
    const { category, sort, fields } = req.query;
    let query = {};
    if (category) query.category = category;

    let findQuery = Destination.find(query);

    if (sort) findQuery = findQuery.sort({ [sort]: 1 });

    if (fields) {
      const projection = fields.split(',').reduce((acc, f) => {
        acc[f.trim()] = 1;
        return acc;
      }, {});
      findQuery = findQuery.select(projection);
    }

    const results = await findQuery.exec();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// GET BY ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Destination.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.status(200).json(item);
  } catch (err) {
    // invalid ObjectId
    return res.status(400).json({ error: "Invalid ID" });
  }
});

// POST (auth + validation) + ownerId
router.post(
  '/',
  isAuthenticated,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('description').optional().trim(),
    body('img').optional().trim(),
    body('location').optional().trim(),
    body('price').optional().isNumeric(),
    body('rating').optional().isNumeric(),
    body('activities').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const payload = { ...req.body, ownerId: req.session.userId }; // NEW
      const savedItem = await new Destination(payload).save();
      res.status(201).json(savedItem);
    } catch (err) {
      res.status(500).json({ error: "Error creating" });
    }
  }
);

// PUT (owner/admin)
router.put(
  '/:id',
  requireOwnerOrAdmin, // NEW
  [
    body('name').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('img').optional().trim(),
    body('location').optional().trim(),
    body('price').optional().isNumeric(),
    body('rating').optional().isNumeric(),
    body('activities').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updates = { ...req.body };
      delete updates.ownerId; // NEVER allow changing owner from client

      const result = await Destination.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: "Not found" });
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: "Invalid ID" });
    }
  }
);

// DELETE (owner/admin)
router.delete('/:id', requireOwnerOrAdmin, async (req, res) => {
  try {
    const result = await Destination.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    return res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;