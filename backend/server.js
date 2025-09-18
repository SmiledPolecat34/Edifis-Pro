const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const logger = require('./config/logger');
const roleRoutes = require('./routes/role.routes');

// Use the same Sequelize instance as models to ensure sync/queries align
const sequelize = require('./config/database');
require('./models'); // Assurez-vous que les modèles sont chargés
const routes = require('./routes');
const statusRoutes = require('./routes/status.routes'); // Import status routes

const FRONT_ORIGINS = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL)
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Initialiser l'application Express
const app = express();

// Middleware de sécurité et logs
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'http://localhost:5000'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(morgan('combined', { stream: logger.stream }));

// Configuration CORS (uniquement une fois)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (FRONT_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.options('*', cors());

// Middleware pour gérer JSON et formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads/profile_pictures',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  },
  express.static('uploads/profile_pictures'),
);

app.use(
  '/uploads/construction_sites',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static('uploads/construction_sites'),
);

app.use('/api/roles', roleRoutes);
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');

    await sequelize.sync();
    console.log('✅ Schéma OK');
  } catch (err) {
    console.error('❌ Erreur d’initialisation DB :', err);
  }
}

// Initialiser la base de données
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
      description: "Documentation de l'API pour la plateforme de gestion de chantiers Edifis-Pro",
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}`, description: 'Développement' },
      { url: 'https://edifis-pro-1.onrender.com/api', description: 'Production' },
    ],
  },
  apis: ['./routes/*.js'], // Pointe vers les fichiers contenant les annotations
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Définir les routes API
app.use('/api/status', statusRoutes); // Add status routes
app.use('/api', routes);

// Route par défaut
app.get('/', (req, res) => {
  res.send('API en ligne avec Sequelize et MySQL !');
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
