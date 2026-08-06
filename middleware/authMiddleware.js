// middleware/authMiddleware.js
// Session-based auth (no JWT). express-session + connect-mongo store the
// session server-side; we just check req.session for the relevant id.

const User = require("../models/User");
const Admin = require("../models/Admin");

// Protect passenger-only pages. Redirects to login instead of a JSON 401
// since this is a server-rendered app.
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Please log in to continue.");
    return res.redirect("/login");
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      req.flash("error", "Your session has expired. Please log in again.");
      return res.redirect("/login");
    }
    req.currentUser = user; // available to controllers
    res.locals.currentUser = user; // available to every EJS view automatically
    next();
  } catch (error) {
    next(error);
  }
};

// Protect admin-only pages.
const requireAdmin = async (req, res, next) => {
  if (!req.session.adminId) {
    req.flash("error", "Please log in as admin to continue.");
    return res.redirect("/admin/login");
  }
  try {
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      req.session.destroy(() => {});
      req.flash("error", "Your admin session has expired. Please log in again.");
      return res.redirect("/admin/login");
    }
    req.currentAdmin = admin;
    res.locals.currentAdmin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

// If already logged in, skip the login/register pages
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.userId) return res.redirect("/dashboard");
  next();
};

const redirectIfAdminAuthenticated = (req, res, next) => {
  if (req.session.adminId) return res.redirect("/admin/dashboard");
  next();
};

module.exports = { requireAuth, requireAdmin, redirectIfAuthenticated, redirectIfAdminAuthenticated };
