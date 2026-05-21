if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.set("strictQuery", false);

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    try {
      console.log("Connected to mongoDb");
    } catch (err) {
      console.log(err);
    }
  }
);

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const images = [
  {
    url: "https://res.cloudinary.com/dibjau5z6/image/upload/v1676900328/AbhiCamp/uabdhtgswpuenq2aicnp.jpg",
    filename: "AbhiCamp/uabdhtgswpuenq2aicnp",
  },
  {
    url: "https://res.cloudinary.com/dibjau5z6/image/upload/v1676900328/AbhiCamp/hpvsi0mvxc0m78irmd5u.jpg",
    filename: "AbhiCamp/hpvsi0mvxc0m78irmd5u",
  },
];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const randomIndex = Math.floor(Math.random() * cities.length);

    const city = cities[randomIndex];

    const price = Math.floor(Math.random() * 1000) + 500;

    const camp = new Campground({
      author: "63f37ac4520eafcc8d7c2e71",

      location: `${city.city}, ${city.state}`,

      title: `${sample(descriptors)} ${sample(places)}`,

      description:
        "Experience nature like never before with scenic views, peaceful surroundings, and unforgettable adventures. Perfect for camping, trekking, photography, and relaxing escapes.",

      price: price,

      geometry: {
        type: "Point",
        coordinates: [city.longitude, city.latitude],
      },

      images: images,
    });

    await camp.save();
  }

  console.log("Database Seeded");
};

seedDB().then(() => {
  mongoose.connection.close();
});
