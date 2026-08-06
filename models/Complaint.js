// server/models/Complaint.js

const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    category: {
      type: String,
      required: true,
      enum: ["cleanliness", "safety", "staff_behaviour", "navigation", "facility", "other"],
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
