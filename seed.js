const mongoose = require("mongoose");
const Destination = require("./models/Destination");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI + "/travelPlannerDB")
  .then(async () => {
    await Destination.deleteMany({});

    const records = [
  {
    name: "Paris City Break",
    category: "Europe",
    description: "3–5 day romantic city break with museums, cafes, and iconic landmarks like the Eiffel Tower and Louvre.",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    location: "Paris, France",
    price: 850,
    rating: 5,
    activities: ["Louvre Museum", "Seine River Cruise", "Eiffel Tower Visit"]
  },
  {
    name: "Rome Historical Weekend",
    category: "Europe",
    description: "Explore ancient Rome with guided tours, authentic Italian cuisine, and famous monuments.",
    img: "/images/italy.png",
    location: "Rome, Italy",
    price: 780,
    rating: 5,
    activities: ["Colosseum Tour", "Vatican Museums", "Trastevere Food Walk"]
  },
  {
    name: "Barcelona Beach & Culture",
    category: "Europe",
    description: "A sunny mix of beaches, Gaudí architecture, and vibrant nightlife in the heart of Catalonia.",
    img: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1200&q=80",
    location: "Barcelona, Spain",
    price: 720,
    rating: 4,
    activities: ["Sagrada Família", "Park Güell", "Barceloneta Beach"]
  },
  {
    name: "Swiss Alps Adventure",
    category: "Europe",
    description: "Mountain escape with hiking, cable cars, and breathtaking alpine views in a clean, safe environment.",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    location: "Interlaken, Switzerland",
    price: 1350,
    rating: 5,
    activities: ["Harder Kulm Viewpoint", "Lake Brienz Cruise", "Jungfrau Region Day Trip"]
  },
  {
    name: "London City Explorer",
    category: "Europe",
    description: "Classic London itinerary: museums, parks, and historic neighborhoods with easy public transport.",
    img: "/images/london.png",
    location: "London, United Kingdom",
    price: 990,
    rating: 4,
    activities: ["British Museum", "Westminster Walk", "Camden Market"]
  },

  {
    name: "Tokyo Modern & Traditional",
    category: "Asia",
    description: "Combine neon city life with temples, sushi markets, and day trips. Perfect for first-time Japan visitors.",
    img: "/images/tokyo.png",
    location: "Tokyo, Japan",
    price: 1200,
    rating: 5,
    activities: ["Shibuya Crossing", "Senso-ji Temple", "Tsukiji Outer Market"]
  },
  {
    name: "Seoul Street Food & K-Culture",
    category: "Asia",
    description: "Trendy neighborhoods, street food markets, and cultural palaces with a strong café culture.",
    img: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=80",
    location: "Seoul, South Korea",
    price: 930,
    rating: 4,
    activities: ["Gyeongbokgung Palace", "Myeongdong Street Food", "Hongdae Night Walk"]
  },
  {
    name: "Bali Island Relaxation",
    category: "Asia",
    description: "Tropical island getaway with beaches, temples, and wellness experiences (spa + yoga).",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    location: "Ubud & Seminyak, Bali (Indonesia)",
    price: 640,
    rating: 4,
    activities: ["Ubud Rice Terraces", "Temple Visit", "Beach Sunset"]
  },
  {
    name: "Bangkok City & Temples",
    category: "Asia",
    description: "A vibrant city break featuring temples, floating markets, and famous Thai cuisine.",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    location: "Bangkok, Thailand",
    price: 520,
    rating: 4,
    activities: ["Grand Palace", "Floating Market", "Street Food Tour"]
  },
  {
    name: "Dubai Skyline & Desert",
    category: "Asia",
    description: "Luxury city experience with modern architecture, shopping, and a desert safari adventure.",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    location: "Dubai, UAE",
    price: 1450,
    rating: 5,
    activities: ["Burj Khalifa", "Desert Safari", "Dubai Marina Walk"]
  },

  {
    name: "New York City Highlights",
    category: "America",
    description: "Big city energy: iconic sights, Broadway, museums, and neighborhoods that never sleep.",
    img: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80",
    location: "New York City, USA",
    price: 1550,
    rating: 5,
    activities: ["Central Park", "Times Square", "Broadway Show"]
  },
  {
    name: "San Francisco & Golden Gate",
    category: "America",
    description: "Coastal city with foggy views, tech vibes, and scenic spots like the Golden Gate Bridge.",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    location: "San Francisco, USA",
    price: 1480,
    rating: 4,
    activities: ["Golden Gate Bridge", "Alcatraz Island", "Fisherman’s Wharf"]
  },
  {
    name: "Vancouver Nature City Break",
    category: "America",
    description: "A clean, safe city surrounded by mountains and ocean, great for walking and light hiking.",
    img: "/images/canada.png",
    location: "Vancouver, Canada",
    price: 1180,
    rating: 4,
    activities: ["Stanley Park", "Capilano Suspension Bridge", "Grouse Mountain"]
  },
  {
    name: "Rio de Janeiro Beach Escape",
    category: "America",
    description: "Famous beaches, viewpoints, and vibrant culture. Great for summer vibes and photography.",
    img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    location: "Rio de Janeiro, Brazil",
    price: 980,
    rating: 4,
    activities: ["Christ the Redeemer", "Copacabana Beach", "Sugarloaf Mountain"]
  },
  {
    name: "Mexico City Food & History",
    category: "America",
    description: "Colorful capital with world-class street food, museums, and day trips to ancient sites.",
    img: "/images/mexico.png",
    location: "Mexico City, Mexico",
    price: 690,
    rating: 5,
    activities: ["Historic Center Walk", "Frida Kahlo Museum", "Teotihuacan Day Trip"]
  },

  {
    name: "Istanbul Two-Continents Tour",
    category: "Europe",
    description: "A unique cultural mix of Europe and Asia with bazaars, mosques, and Bosphorus views.",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    location: "Istanbul, Türkiye",
    price: 610,
    rating: 4,
    activities: ["Hagia Sophia", "Grand Bazaar", "Bosphorus Cruise"]
  },
  {
    name: "Prague Old Town Weekend",
    category: "Europe",
    description: "Fairytale architecture, river views, and cozy cafes—ideal for a short European weekend trip.",
    img: "/images/prague.png",
    location: "Prague, Czech Republic",
    price: 560,
    rating: 4,
    activities: ["Charles Bridge", "Prague Castle", "Old Town Square"]
  },
  {
    name: "Singapore Clean City Experience",
    category: "Asia",
    description: "Modern city with gardens, skyline viewpoints, and excellent public transport—great for 3–4 days.",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    location: "Singapore",
    price: 1120,
    rating: 5,
    activities: ["Gardens by the Bay", "Marina Bay Sands SkyPark", "Chinatown Food"]
  },
  {
    name: "Almaty Mountains & City",
    category: "Asia",
    description: "A balanced trip: city cafes + nearby mountain nature, with easy day trips to scenic locations.",
    img: "/images/almaty.png",
    location: "Almaty, Kazakhstan",
    price: 430,
    rating: 4,
    activities: ["Medeu Skating Rink", "Shymbulak Resort", "Kok-Tobe Hill"]
  },
  {
    name: "Cape Town Ocean & Mountains",
    category: "Africa",
    description: "Iconic coastal landscapes, mountain viewpoints, and rich local culture with great weather.",
    img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
    location: "Cape Town, South Africa",
    price: 1050,
    rating: 5,
    activities: ["Table Mountain", "Cape Point", "V&A Waterfront"]
  }
];

    await Destination.insertMany(records);
    console.log("✅ 20 realistic destinations inserted into travelPlannerDB.");
    process.exit();
  })
  .catch((err) => console.error(err));






