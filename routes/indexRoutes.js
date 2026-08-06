// routes/indexRoutes.js

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "RailNav — Smart Railway Station Navigation", layout: "layout-public" });
});

module.exports = router;
