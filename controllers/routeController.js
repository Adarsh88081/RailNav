// controllers/routeController.js

const Location = require("../models/Location");
const User = require("../models/User");
const { getAllStations } = require("./stationController");
const { getRouteBetween } = require("../services/graphService");

// GET /route-finder?station=<id>&from=<name>&to=<name>
// Progressive disclosure entirely via query params + auto-submitting
// <select> elements (see views/route-finder.ejs) — no fetch/AJAX.
const showRouteFinder = async (req, res, next) => {
  try {
    const { station, from, to } = req.query;

    const stations = await getAllStations();
    let locations = [];
    let route = null;

    if (station) {
      locations = await Location.find({ station }).sort("name");

      if (from && to) {
        if (from === to) {
          req.flash("error", "Current location and destination cannot be the same.");
        } else {
          try {
            route = await getRouteBetween(station, from, to);
            route.stationId = station;

            // Save this search into the passenger's profile history
            const stationDoc = stations.find((s) => String(s._id) === station);
            await User.findByIdAndUpdate(req.currentUser._id, {
              $push: {
                previousSearches: {
                  $each: [{ station: stationDoc ? stationDoc.name : "", from, to }],
                  $position: 0,
                  $slice: 20,
                },
              },
            });
          } catch (err) {
            req.flash("error", err.message);
          }
        }
      }
    }

    res.render("route-finder", {
      title: "Find Route",
      stations,
      locations,
      selectedStation: station || "",
      selectedFrom: from || "",
      selectedTo: to || "",
      route,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { showRouteFinder };
