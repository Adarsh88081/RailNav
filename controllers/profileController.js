// controllers/profileController.js

const Complaint = require("../models/Complaint");

const showProfile = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.currentUser._id })
      .populate("station", "name code")
      .sort("-createdAt");
    res.render("profile", { title: "My Profile", complaints });
  } catch (error) {
    next(error);
  }
};

module.exports = { showProfile };
