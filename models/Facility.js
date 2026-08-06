// server/models/Facility.js
// Amenities available at a station (searchable, shown on Facilities page).

const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Washroom"
    category: {
      type: String,
      required: true,
      enum: [
        "hygiene",
        "food",
        "medical",
        "finance",
        "assistance",
        "transport",
        "shopping",
        "waiting",
        "security",
        "other",
      ],
    },
    // Free-text description of where it is, e.g. "Near Platform 3, opposite Book Stall"
    locationDescription: { type: String, trim: true },
    // Optionally link to a graph node so it can be used as a route destination
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
