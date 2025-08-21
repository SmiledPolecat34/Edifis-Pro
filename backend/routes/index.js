const express = require("express");
const router = express.Router();

// Importation des routes
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");
const timesheetRoutes = require("./timesheet.routes");
const constructionSiteRoutes = require("./constructionSite.routes");
const competenceRoutes = require("./competence.routes");
const authRoutes = require("./auth.routes");

// Utilisation des routes
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/timesheets", timesheetRoutes);
router.use("/construction-sites", constructionSiteRoutes);
router.use("/competences", competenceRoutes);
router.use("/auth", authRoutes);

module.exports = router;
