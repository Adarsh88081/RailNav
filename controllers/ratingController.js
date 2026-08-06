// controllers/ratingController.js

const Rating = require("../models/Rating");

// POST /route-finder/rate
// Redirects back to the route finder with the same station/from/to in
// the query string so the passenger still sees the route they rated.
const createRating = async (req, res, next) => {
  try {
    const { station, stars, feedback, from, to } = req.body;
    if (!station || !stars) {
      req.flash("error", "Please select a star rating first.");
    } else {
      await Rating.create({ user: req.currentUser._id, station, stars: Number(stars), feedback });
      req.flash("success", "Thanks for your feedback!");
    }
    const params = new URLSearchParams({ station, from, to }).toString();
    res.redirect(`/route-finder?${params}`);
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------
const showAdminRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find()
      .populate("user", "name email")
      .populate("station", "name code")
      .sort("-createdAt");
    res.render("admin/ratings", { title: "Ratings", ratings, layout: "admin/admin-layout" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRating, showAdminRatings };
