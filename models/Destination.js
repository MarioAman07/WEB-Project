// models/Destination.js (Новый файл для модели destinations с mongoose)
const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  // NEW: owner of the record
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  img: String,
  location: String, // Добавляем новые поля для 5-8 meaningful fields
  price: Number,
  rating: Number,
  activities: [String],
  createdAt: { type: Date, default: Date.now }
});

const Destination = mongoose.model('Destination', destinationSchema);
module.exports = Destination;