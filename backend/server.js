const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const logger = require("./config/logger");

const sequelize = require("./config/sequelize");
require("./models"); // Assurez-vous que les modèles sont chargés
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

async function dropAll() {
  const qi = sequelize.getQueryInterface();
  try {
    console.warn('⚠️ DB_RESET: désactivation des clés étrangères…');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // ORDRE ENFANTS → PARENTS
    // Enfants de users/tasks/construction_site
    await qi.dropTable('user_tasks');             // FK → users, Task
    await qi.dropTable('password_reset_tokens');  // FK → users

    // Tâches (enfant de construction_site)
    await qi.dropTable('Task');                   // FK → construction_site

    // Pivot users <-> competences (enfant de users + competences)
    await qi.dropTable('user_competences');       // FK → users, competences

    // Compétences (parent de user_competences)
    await qi.dropTable('competences');

    // Chantiers (parent de Task)
    await qi.dropTable('construction_site');

    // Users (parent de beaucoup de choses + référencé par construction_site.chef_de_projet_id)
    await qi.dropTable('users');

    // Rôles (parent de users.role_id)
    await qi.dropTable('roles');

    console.log('🧹 Drop terminé');
  } catch (e) {
    console.error('❌ Drop error:', e);
  } finally {
    console.warn('🔁 Réactivation des clés étrangères…');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

// Initialiser la base de données
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');

    // if (process.env.DB_RESET === 'true') {
    //   await dropAll();
    // }

    // En routine, ne détruis pas: ajuste le schéma
    await sequelize.sync({ alter: true });
    console.log('✅ Schéma OK');
  } catch (err) {
    console.error('❌ Erreur d’initialisation DB :', err);
  }
}

initDB();

// Configuration de Swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Edifis-Pro',
      version: '1.0.0',
      description: 'Documentation de l\'API pour la plateforme de gestion de chantiers Edifis-Pro',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./routes/*.js'], // Pointe vers les fichiers contenant les annotations
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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

