const { MongoClient } = require('mongodb');

// Connection string from environment variables
const url = process.env.MONGO_URI;

if (!url) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const client = new MongoClient(url);

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