// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination'); // Переходим на mongoose модель
const { body, validationResult } = require('express-validator'); // Для валидации
const isAuthenticated = require('../middleware/auth'); // Новый middleware, см. ниже

// 1. GET ALL (с Сортировкой и Проекцией)
router.get('/', async (req, res) => {
    try {
        const { category, sort, fields } = req.query; // Получаем параметры из ссылки
        let query = {};
        if (category) query.category = category;
        let findQuery = Destination.find(query);
        // --- ЛОГИКА СОРТИРОВКИ (SORTING) ---
        if (sort) {
            findQuery = findQuery.sort({ [sort]: 1 });
        }
        // --- ЛОГИКА ПРОЕКЦИИ (PROJECTION) ---
        if (fields) {
            const projection = fields.split(',').reduce((acc, f) => { acc[f.trim()] = 1; return acc; }, {});
            findQuery = findQuery.select(projection);
        }
        const results = await findQuery.exec();
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});
// 2. GET BY ID (Получение одной записи)
router.get('/:id', async (req, res) => {
    try {
        const item = await Destination.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// 3. POST (Оставляем как есть + валидация + auth)
router.post('/', isAuthenticated, [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('description').optional().trim(),
  body('img').optional().trim(),
  body('location').optional().trim(),
  body('price').optional().isNumeric(),
  body('rating').optional().isNumeric(),
  body('activities').optional().isArray()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const newItem = new Destination(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: "Error creating" });
    }
});
// 4. PUT /api/items/:id - Обновление + валидация + auth
router.put('/:id', isAuthenticated, [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  // Добавь для других полей
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updates = req.body;
        const result = await Destination.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!result) return res.status(404).json({ error: "Not found" });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});
// 5. DELETE /api/items/:id (Удаление одного) + auth
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await Destination.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: "Not found" });
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});
module.exports = router;