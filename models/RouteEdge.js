// server/models/RouteEdge.js
// An edge in the station graph: a direct walkable path between two Locations.
// The BFS shortest-path engine (server/services/graphService.js) is built
// entirely on top of this collection.

const mongoose = require("mongoose");

const routeEdgeSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    distanceMeters: { type: Number, required: true, min: 1 },
    // Human-readable instruction for walking this specific segment
    instruction: { type: String, required: true, trim: true },
    // Most station paths are walkable both ways
    bidirectional: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RouteEdge", routeEdgeSchema);
