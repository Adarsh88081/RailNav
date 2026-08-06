// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { showRegister, register, showLogin, login, logout } = require("../controllers/authController");
const { redirectIfAuthenticated } = require("../middleware/authMiddleware");

router.get("/register", redirectIfAuthenticated, showRegister);
router.post("/register", redirectIfAuthenticated, register);
router.get("/login", redirectIfAuthenticated, showLogin);
router.post("/login", redirectIfAuthenticated, login);
router.post("/logout", logout);

module.exports = router;
