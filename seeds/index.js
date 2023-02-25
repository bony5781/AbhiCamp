if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


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

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 100) + 10;
    const location = `${cities[random1000].city},${cities[random1000].state}`;
    const geoData = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    }).send();
    const camp = new Campground({
      author: "63f37ac4520eafcc8d7c2e71",
      location: location,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
      price: price,
      geometry: geoData.body.features[0].geometry,
      images: [
        {
          url: "https://res.cloudinary.com/dibjau5z6/image/upload/v1676900328/AbhiCamp/uabdhtgswpuenq2aicnp.jpg",
          filename: "AbhiCamp/uabdhtgswpuenq2aicnp",
        },
        {
          url: "https://res.cloudinary.com/dibjau5z6/image/upload/v1676900328/AbhiCamp/hpvsi0mvxc0m78irmd5u.jpg",
          filename: "AbhiCamp/hpvsi0mvxc0m78irmd5u",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
