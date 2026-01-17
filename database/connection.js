const { MongoClient } = require('mongodb');

// Строка подключения к локальной MongoDB
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Имя базы данных
const dbName = 'travelPlannerDB';
let db;

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db(dbName);
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
}

module.exports = { connectDB, getDb };