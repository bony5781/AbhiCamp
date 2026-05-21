const Campground = require("../models/campground");

const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res, next) => {

  // NEWEST CAMPGROUNDS FIRST
  const campgrounds = await Campground.find({}).sort({ _id: -1 });

  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {

  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {

  const campground = new Campground(req.body.campground);

  // DEFAULT LOCATION (KOLKATA)
  campground.geometry = {
    type: "Point",
    coordinates: [88.3639, 22.5726],
  };

  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  campground.author = req.user._id;

  await campground.save();

  req.flash("success", "Successfully made a new campground");

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {

  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  if (!campground) {

    req.flash("error", "Cannot find that campground");

    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  if (!campground) {

    req.flash("error", "Cannot find that campground");

    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {

  const { id } = req.params;

  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });

  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  campground.images.push(...imgs);

  await campground.save();

  if (req.body.deleteImages) {

    for (let filename of req.body.deleteImages) {

      await cloudinary.uploader.destroy(filename);
    }

    await campground.updateOne({
      $pull: {
        images: {
          filename: { $in: req.body.deleteImages },
        },
      },
    });
  }

  req.flash("success", "Successfully updated");

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {

  const { id } = req.params;

  await Campground.findByIdAndDelete(id);

  req.flash("success", "Deleted campground");

  res.redirect("/campgrounds");
};
