// controllers/complaintController.js

const Complaint = require("../models/Complaint");
const { getAllStations } = require("./stationController");

const showComplaintForm = async (req, res, next) => {
  try {
    const stations = await getAllStations();
    res.render("complaint", { title: "Submit a Complaint", stations });
  } catch (error) {
    next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const { station, category, description } = req.body;
    if (!station || !category || !description) {
      req.flash("error", "All fields are required.");
      return res.redirect("/complaint");
    }
    await Complaint.create({ user: req.currentUser._id, station, category, description });
    req.flash("success", "Your complaint has been submitted.");
    res.redirect("/complaint");
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------

const showAdminComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .populate("station", "name code")
      .sort("-createdAt");
    res.render("admin/complaints", { title: "Complaints", complaints, layout: "admin/admin-layout" });
  } catch (error) {
    next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
      req.flash("error", "Invalid status value.");
      return res.redirect("/admin/complaints");
    }
    await Complaint.findByIdAndUpdate(req.params.id, { status });
    req.flash("success", "Complaint status updated.");
    res.redirect("/admin/complaints");
  } catch (error) {
    next(error);
  }
};

module.exports = { showComplaintForm, createComplaint, showAdminComplaints, updateComplaintStatus };
