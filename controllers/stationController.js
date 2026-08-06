// controllers/stationController.js

const Station = require("../models/Station");
const Location = require("../models/Location");
const RouteEdge = require("../models/RouteEdge");
const Facility = require("../models/Facility");

// Reusable helper — other controllers need the station list too (route
// finder, facilities page, complaint form, admin dropdowns).
const getAllStations = () => Station.find({ isActive: true }).sort("name");

// ---------- Admin: Stations management ----------

const showAdminStations = async (req, res, next) => {
  try {
    const stations = await getAllStations();
    res.render("admin/stations", { title: "Manage Stations", stations, layout: "admin/admin-layout" });
  } catch (error) {
    next(error);
  }
};

const createStation = async (req, res, next) => {
  try {
    const { name, code, city } = req.body;
    if (!name || !code || !city) {
      req.flash("error", "Name, code and city are all required.");
      return res.redirect("/admin/stations");
    }
    await Station.create({ name, code, city });
    req.flash("success", `Station "${name}" added.`);
    res.redirect("/admin/stations");
  } catch (error) {
    if (error.code === 11000) {
      req.flash("error", "A station with that code already exists.");
      return res.redirect("/admin/stations");
    }
    next(error);
  }
};

const showEditStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      req.flash("error", "Station not found.");
      return res.redirect("/admin/stations");
    }
    res.render("admin/edit-station", { title: "Edit Station", station, layout: "admin/admin-layout" });
  } catch (error) {
    next(error);
  }
};

const updateStation = async (req, res, next) => {
  try {
    const { name, code, city } = req.body;
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { name, code, city },
      { new: true, runValidators: true }
    );
    if (!station) {
      req.flash("error", "Station not found.");
      return res.redirect("/admin/stations");
    }
    req.flash("success", `Station "${station.name}" updated.`);
    res.redirect("/admin/stations");
  } catch (error) {
    next(error);
  }
};

const deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      req.flash("error", "Station not found.");
      return res.redirect("/admin/stations");
    }
    // Keep the graph consistent: remove everything that belongs to this station
    await Promise.all([
      Location.deleteMany({ station: station._id }),
      RouteEdge.deleteMany({ station: station._id }),
      Facility.deleteMany({ station: station._id }),
      station.deleteOne(),
    ]);
    req.flash("success", `Station "${station.name}" and all related data deleted.`);
    res.redirect("/admin/stations");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStations,
  showAdminStations,
  createStation,
  showEditStation,
  updateStation,
  deleteStation,
};
