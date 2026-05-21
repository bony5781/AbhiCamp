if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const MongoStore = require("connect-mongo");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");

const Campground = require("./models/campground");
const cities = require("./seeds/cities");
const { places, descriptors } = require("./seeds/seedHelpers");

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

const db = mongoose.connection;

db.on("error", (err) => console.error(err));

db.once("open", async () => {
  console.log("> Database connection established");

  const count = await Campground.countDocuments();

  if (count === 0) {
    console.log("Seeding database...");

    const sample = (array) =>
      array[Math.floor(Math.random() * array.length)];

   const images = [
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    filename: "camp1",
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    filename: "camp2",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    filename: "camp3",
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    filename: "camp4",
  },
  {
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
    filename: "camp5",
  },
  {
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    filename: "camp6",
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    filename: "camp7",
  },
  {
    url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
    filename: "camp8",
  },
  {
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    filename: "camp9",
  },
  {
    url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff",
    filename: "camp10",
  },
];

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

        images: [
  images[Math.floor(Math.random() * images.length)],
],
      });

      await camp.save();
    }

    console.log("Database Seeded");
  }
});

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "Pokimane",
  },
});

const sessionConfig = {
  store,
  name: "excelsior",
  secret: "Pokimane",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);

app.use("/campgrounds", campgroundsRoutes);

app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  if (!err.message) err.message = "Oh No, Something went wrong!";

  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 8800;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
