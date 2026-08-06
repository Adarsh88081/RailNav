// controllers/suggestionController.js

const Suggestion = require("../models/Suggestion");

const showSuggestionForm = (req, res) => {
  res.render("suggestion", { title: "Suggestions" });
};

const createSuggestion = async (req, res, next) => {
  try {
    const { name, email, suggestion } = req.body;
    if (!name || !email || !suggestion) {
      req.flash("error", "All fields are required.");
      return res.redirect("/suggestion");
    }
    await Suggestion.create({ name, email, suggestion });
    req.flash("success", "Thanks — your suggestion has been received.");
    res.redirect("/suggestion");
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------
const showAdminSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find().sort("-createdAt");
    res.render("admin/suggestions", { title: "Suggestions", suggestions, layout: "admin/admin-layout" });
  } catch (error) {
    next(error);
  }
};

module.exports = { showSuggestionForm, createSuggestion, showAdminSuggestions };
