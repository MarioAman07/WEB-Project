// seed.js (Новый файл для 20 записей, запусти node seed.js локально один раз)
const mongoose = require('mongoose');
const Destination = require('./models/Destination');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI + '/travelPlannerDB')
  .then(async () => {
    await Destination.deleteMany({}); // Очищаем для теста
    const records = [];
    for (let i = 1; i <= 20; i++) {
      records.push({
        name: `Destination ${i}`,
        category: ['Europe', 'Asia', 'America'][i % 3],
        description: `Description for dest ${i}`,
        img: `https://example.com/img${i}.jpg`,
        location: `Location ${i}`,
        price: i * 100,
        rating: (i % 5) + 1,
        activities: [`Activity1-${i}`, `Activity2-${i}`]
      });
    }
    await Destination.insertMany(records);
    console.log('20 realistic records added. Adapt with real data.');
    process.exit();
  })
  .catch(err => console.error(err));