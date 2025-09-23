const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validator.middleware');
const { rateLimitIPAndEmail, rateLimitIP } = require('../middlewares/rateLimit.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, role]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string }
 *     responses:
 *       201: { description: Utilisateur créé }
 *       400: { description: Données invalides }
 */
router.post('/register', validate(schemas.register), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Identifiants invalides }
 */
router.post(
  '/login',
  rateLimitIPAndEmail(), // anti brute-force
  validate(schemas.login),
  authController.login,
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Envoie un email de réinitialisation de mot de passe
 *     tags: [Auth]
 */
router.post(
  '/forgot-password',
  rateLimitIPAndEmail(),
  validate(schemas.forgotPassword),
  authController.forgotPassword,
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Mot de passe réinitialisé }
 *       400: { description: Token invalide ou expiré }
 */
router.post(
  '/reset-password',
  rateLimitIP(),
  validate(schemas.resetPassword),
  authController.resetPassword,
);

module.exports = router;
