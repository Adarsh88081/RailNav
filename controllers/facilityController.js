// controllers/facilityController.js

const Facility = require("../models/Facility");
const { getAllStations } = require("./stationController");

// GET /facilities?station=<id>&search=<text>&category=<cat>
const showFacilities = async (req, res, next) => {
  try {
    const { station, search, category } = req.query;
    const stations = await getAllStations();

    let facilities = [];
    if (station) {
      const query = { station };
      if (category) query.category = category;
      if (search) query.name = { $regex: search, $options: "i" };
      facilities = await Facility.find(query).sort("name");
    }

    res.render("facilities", {
      title: "Station Facilities",
      stations,
      facilities,
      selectedStation: station || "",
      search: search || "",
      category: category || "",
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------

const showAdminFacilities = async (req, res, next) => {
  try {
    const { station } = req.query;
    const stations = await getAllStations();
    let facilities = [];
    if (station) {
      facilities = await Facility.find({ station }).sort("name");
    }
    res.render("admin/facilities", {
      title: "Manage Facilities",
      stations,
      facilities,
      selectedStation: station || "",
      layout: "admin/admin-layout",
    });
  } catch (error) {
    next(error);
  }
};

const createFacility = async (req, res, next) => {
  try {
    const { station, name, category, locationDescription } = req.body;
    if (!station || !name || !category) {
      req.flash("error", "Station, name and category are required.");
      return res.redirect(`/admin/facilities?station=${station || ""}`);
    }
    await Facility.create({ station, name, category, locationDescription });
    req.flash("success", `Facility "${name}" added.`);
    res.redirect(`/admin/facilities?station=${station}`);
  } catch (error) {
    next(error);
  }
};

const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    req.flash("success", "Facility deleted.");
    res.redirect(`/admin/facilities?station=${facility ? facility.station : ""}`);
  } catch (error) {
    next(error);
  }
};

module.exports = { showFacilities, showAdminFacilities, createFacility, deleteFacility };
