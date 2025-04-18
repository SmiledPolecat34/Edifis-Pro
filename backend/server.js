const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const initDB = require("./config/sequelize");
const routes = require("./routes");

// Initialiser l'application Express
const app = express();

// Middleware de sécurité et logs
app.use(helmet());
app.use(morgan("dev"));

// Configuration CORS (uniquement une fois)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware pour gérer JSON et formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads/profile_pictures", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
}, express.static("uploads/profile_pictures"));

app.use("/uploads/construction_sites", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static("uploads/construction_sites"));

// Initialiser la base de données
initDB();

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: http://localhost:5000;");
  next();
});

// Définir les routes API
app.use("/api", routes);

// Route par défaut
app.get("/", (req, res) => {
  res.send("API en ligne avec Sequelize et MySQL !");
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
});
