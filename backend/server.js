const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const logger = require("./config/logger");

const initDB = require("./config/sequelize");
const routes = require("./routes");

const FRONT_ORIGINS = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);


// Initialiser l'application Express
const app = express();

// Middleware de sécurité et logs
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:", "http://localhost:5000"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "no-referrer" },
  hsts: process.env.NODE_ENV === "production" ? undefined : false
}));
app.use(morgan("combined", { stream: logger.stream }));

// Configuration CORS (uniquement une fois)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients
    if (FRONT_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
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

