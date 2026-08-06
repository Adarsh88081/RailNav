// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { requireAdmin, redirectIfAdminAuthenticated } = require("../middleware/authMiddleware");

const { showAdminLogin, adminLogin, adminLogout, showAdminDashboard } = require("../controllers/adminController");
const {
  showAdminStations,
  createStation,
  showEditStation,
  updateStation,
  deleteStation,
} = require("../controllers/stationController");
const { showAdminGraph, addLocation, deleteLocation, addEdge, deleteEdge } = require("../controllers/graphController");
const { showAdminFacilities, createFacility, deleteFacility } = require("../controllers/facilityController");
const { showAdminComplaints, updateComplaintStatus } = require("../controllers/complaintController");
const { showAdminSuggestions } = require("../controllers/suggestionController");
const { showAdminRatings } = require("../controllers/ratingController");

// Public
router.get("/login", redirectIfAdminAuthenticated, showAdminLogin);
router.post("/login", redirectIfAdminAuthenticated, adminLogin);
router.post("/logout", adminLogout);

// Everything below requires an admin session
router.use(requireAdmin);

router.get("/dashboard", showAdminDashboard);

router.get("/stations", showAdminStations);
router.post("/stations", createStation);
router.get("/stations/:id/edit", showEditStation);
router.put("/stations/:id", updateStation);
router.delete("/stations/:id", deleteStation);

router.get("/graph", showAdminGraph);
router.post("/graph/locations", addLocation);
router.delete("/graph/locations/:id", deleteLocation);
router.post("/graph/edges", addEdge);
router.delete("/graph/edges/:id", deleteEdge);

router.get("/facilities", showAdminFacilities);
router.post("/facilities", createFacility);
router.delete("/facilities/:id", deleteFacility);

router.get("/complaints", showAdminComplaints);
router.put("/complaints/:id", updateComplaintStatus);

router.get("/suggestions", showAdminSuggestions);

router.get("/ratings", showAdminRatings);

module.exports = router;
