// controllers/dashboardController.js

const showDashboard = (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
};

module.exports = { showDashboard };
