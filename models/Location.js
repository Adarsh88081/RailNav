// server/models/Location.js
// Every node inside a station's navigation graph is a Location.

const mongoose = require("mongoose");

const LOCATION_TYPES = [
  "platform",
  "escalator",
  "lift",
  "waiting_hall",
  "exit",
  "metro",
  "food_court",
  "army_lounge",
  "vip_lounge",
  "parking",
  "foot_over_bridge",
  "washroom",
  "atm",
  "book_stall",
  "medical_room",
  "booking_counter",
  "parcel_office",
  "taxi_stand",
  "bus_stand",
  "retiring_room",
  "police_desk",
  "lost_and_found",
  "other",
];

const locationSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Platform 6", "Escalator A"
    type: { type: String, enum: LOCATION_TYPES, required: true },
  },
  { timestamps: true }
);

// A location name must be unique within a given station
locationSchema.index({ station: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Location", locationSchema);
module.exports.LOCATION_TYPES = LOCATION_TYPES;
