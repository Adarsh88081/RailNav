// controllers/adminController.js

const Admin = require("../models/Admin");
const Station = require("../models/Station");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Suggestion = require("../models/Suggestion");
const Rating = require("../models/Rating");

const showAdminLogin = (req, res) => {
  res.render("admin/admin-login", { title: "Admin Login", layout: "admin/admin-layout-blank" });
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN ATTEMPT:", JSON.stringify(email), JSON.stringify(password));

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/admin/login");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
    console.log("ADMIN FOUND:", admin ? admin.email : "NONE");

    if (!admin) {
      req.flash("error", "Invalid admin credentials.");
      return res.redirect("/admin/login");
    }

    const isMatch = await admin.matchPassword(password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      req.flash("error", "Invalid admin credentials.");
      return res.redirect("/admin/login");
    }

    req.session.adminId = admin._id;
    req.flash("success", `Welcome back, ${admin.name}.`);
    res.redirect("/admin/dashboard");
  } catch (error) {
    next(error);
  }
};

const adminLogout = (req, res) => {
  req.session.adminId = null;
  // Only destroy the session if no passenger is also logged in on it
  if (!req.session.userId) {
    return req.session.destroy(() => res.redirect("/admin/login"));
  }
  res.redirect("/admin/login");
};

const showAdminDashboard = async (req, res, next) => {
  try {
    const [totalStations, totalUsers, complaintStats, totalSuggestions, ratingStats] = await Promise.all([
      Station.countDocuments(),
      User.countDocuments(),
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Suggestion.countDocuments(),
      Rating.aggregate([{ $group: { _id: null, average: { $avg: "$stars" }, count: { $sum: 1 } } }]),
    ]);

    const complaintsByStatus = { Pending: 0, "In Progress": 0, Resolved: 0 };
    complaintStats.forEach((c) => (complaintsByStatus[c._id] = c.count));

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      layout: "admin/admin-layout",
      stats: {
        totalStations,
        totalUsers,
        complaintsByStatus,
        totalSuggestions,
        averageRating: ratingStats[0] ? Math.round(ratingStats[0].average * 10) / 10 : 0,
        totalRatings: ratingStats[0] ? ratingStats[0].count : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { showAdminLogin, adminLogin, adminLogout, showAdminDashboard };