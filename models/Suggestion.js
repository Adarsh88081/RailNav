// server/models/Suggestion.js

const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    suggestion: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestion", suggestionSchema);
