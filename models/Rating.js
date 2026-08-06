// server/models/Rating.js

const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
