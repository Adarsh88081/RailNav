// controllers/authController.js

const User = require("../models/User");

const showRegister = (req, res) => {
  res.render("register", { title: "Create Account", layout: "layout-public" });
};

const register = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/register");
    }

    const user = await User.create({ name, email, password });
    req.session.userId = user._id;
    req.flash("success", `Welcome to RailNav, ${user.name}!`);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

const showLogin = (req, res) => {
  res.render("login", { title: "Log In", layout: "layout-public" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.session.userId = user._id;
    req.flash("success", `Welcome back, ${user.name}!`);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

module.exports = { showRegister, register, showLogin, login, logout };
