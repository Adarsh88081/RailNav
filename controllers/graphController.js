// controllers/graphController.js
// Admin management of the navigation graph itself: Locations (nodes) and
// RouteEdges (walkable connections). This is what the BFS engine in
// services/graphService.js runs on.

const Location = require("../models/Location");
const RouteEdge = require("../models/RouteEdge");
const { getAllStations } = require("./stationController");
const { LOCATION_TYPES } = require("../models/Location");

const showAdminGraph = async (req, res, next) => {
  try {
    const { station } = req.query;
    const stations = await getAllStations();

    let locations = [];
    let edges = [];
    if (station) {
      locations = await Location.find({ station }).sort("name");
      edges = await RouteEdge.find({ station }).populate("from", "name").populate("to", "name");
    }

    res.render("admin/graph", {
      title: "Locations & Navigation Graph",
      stations,
      locations,
      edges,
      locationTypes: LOCATION_TYPES,
      selectedStation: station || "",
      layout: "admin/admin-layout",
    });
  } catch (error) {
    next(error);
  }
};

const addLocation = async (req, res, next) => {
  try {
    const { station, name, type } = req.body;
    if (!station || !name || !type) {
      req.flash("error", "Station, name and type are required.");
      return res.redirect(`/admin/graph?station=${station || ""}`);
    }
    await Location.create({ station, name, type });
    req.flash("success", `Location "${name}" added.`);
    res.redirect(`/admin/graph?station=${station}`);
  } catch (error) {
    if (error.code === 11000) {
      req.flash("error", "A location with that name already exists for this station.");
      return res.redirect(`/admin/graph?station=${req.body.station}`);
    }
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    req.flash("success", "Location deleted.");
    res.redirect(`/admin/graph?station=${location ? location.station : ""}`);
  } catch (error) {
    next(error);
  }
};

const addEdge = async (req, res, next) => {
  const { station, from, to, distanceMeters, instruction, bidirectional } = req.body;
  try {
    if (!station || !from || !to || !distanceMeters || !instruction) {
      req.flash("error", "All edge fields are required.");
      return res.redirect(`/admin/graph?station=${station || ""}`);
    }
    if (from === to) {
      req.flash("error", "From and To locations must be different.");
      return res.redirect(`/admin/graph?station=${station}`);
    }
    await RouteEdge.create({
      station,
      from,
      to,
      distanceMeters: Number(distanceMeters),
      instruction,
      bidirectional: bidirectional === "on" || bidirectional === true,
    });
    req.flash("success", "Edge added.");
    res.redirect(`/admin/graph?station=${station}`);
  } catch (error) {
    next(error);
  }
};

const deleteEdge = async (req, res, next) => {
  try {
    const edge = await RouteEdge.findByIdAndDelete(req.params.id);
    req.flash("success", "Edge deleted.");
    res.redirect(`/admin/graph?station=${edge ? edge.station : ""}`);
  } catch (error) {
    next(error);
  }
};

module.exports = { showAdminGraph, addLocation, deleteLocation, addEdge, deleteEdge };
