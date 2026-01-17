const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');
const { ObjectId } = require('mongodb');

// 1. GET ALL (с Сортировкой и Проекцией)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { category, sort, fields } = req.query; // Получаем параметры из ссылки

        let query = {};
        if (category) query.category = category;

        let cursor = db.collection('destinations').find(query);

        // --- ЛОГИКА СОРТИРОВКИ (SORTING) ---
        if (sort) {
            // Если sort=name, сортируем по name по возрастанию (1)
            cursor = cursor.sort({ [sort]: 1 });
        }

        // --- ЛОГИКА ПРОЕКЦИИ (PROJECTION) ---
        if (fields) {
            // Если fields=name,category -> превращаем в объект { name: 1, category: 1 }
            const projection = {};
            fields.split(',').forEach(f => projection[f.trim()] = 1);
            cursor = cursor.project(projection);
        }

        const results = await cursor.toArray();
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 2. GET BY ID (Получение одной записи)
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        // Проверяем, валидный ли ID
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Ищем конкретную запись по _id
        const item = await db.collection('destinations').findOne({ _id: new ObjectId(req.params.id) });
        
        if (!item) return res.status(404).json({ error: "Not found" });
        
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST (Оставляем как есть)
router.post('/', async (req, res) => {
    try {
        const { name, category, description, img } = req.body;
        if (!name || !category) return res.status(400).json({ error: "Missing fields" });

        const newItem = {
            name, category, description, img, createdAt: new Date()
        };
        const db = getDb();
        const result = await db.collection('destinations').insertOne(newItem);
        res.status(201).json({ _id: result.insertedId, ...newItem });
    } catch (err) {
        res.status(500).json({ error: "Error creating" });
    }
});

// PUT /api/items/:id - Теперь обновляет ВСЕ поля
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        // Убираем _id из тела запроса, чтобы не было ошибки (id менять нельзя)
        const { _id, ...updates } = req.body; 

        const result = await db.collection('destinations').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates } // Обновляем все поля, которые пришли
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "Not found" });
        res.status(200).json({ message: "Updated" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE /api/items/all - НОВЫЙ МАРШРУТ ДЛЯ УДАЛЕНИЯ ВСЕГО
router.delete('/all', async (req, res) => {
    try {
        const db = getDb();
        await db.collection('destinations').deleteMany({}); // Удаляет всё
        res.status(200).json({ message: "All items deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete all failed" });
    }
});

// DELETE /api/items/:id (Удаление одного)
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.collection('destinations').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;