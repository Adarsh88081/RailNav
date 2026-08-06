// routes/appRoutes.js
// All passenger-facing pages that require login.

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");

const { showDashboard } = require("../controllers/dashboardController");
const { showRouteFinder } = require("../controllers/routeController");
const { createRating } = require("../controllers/ratingController");
const { showFacilities } = require("../controllers/facilityController");
const { showComplaintForm, createComplaint } = require("../controllers/complaintController");
const { showSuggestionForm, createSuggestion } = require("../controllers/suggestionController");
const { showProfile } = require("../controllers/profileController");

router.get("/dashboard", requireAuth, showDashboard);

router.get("/route-finder", requireAuth, showRouteFinder);
router.post("/route-finder/rate", requireAuth, createRating);

router.get("/facilities", requireAuth, showFacilities);

router.get("/complaint", requireAuth, showComplaintForm);
router.post("/complaint", requireAuth, createComplaint);

router.get("/suggestion", requireAuth, showSuggestionForm);
router.post("/suggestion", requireAuth, createSuggestion);

router.get("/profile", requireAuth, showProfile);

module.exports = router;