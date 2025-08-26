const express = require("express");
const router = express.Router();

// Importation des routes
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");
const constructionSiteRoutes = require("./constructionSite.routes");
const competenceRoutes = require("./competence.routes");
const authRoutes = require("./auth.routes");
const roleRoutes = require("./role.routes.js"); // Ajout des routes de rôle

// Utilisation des routes
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/construction-sites", constructionSiteRoutes);
router.use("/competences", competenceRoutes);
router.use("/auth", authRoutes);
router.use("/roles", roleRoutes); // Ajout des routes de rôle

module.exports = router;
