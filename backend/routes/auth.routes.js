const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validate, schemas } = require("../middlewares/validator.middleware");
const { rateLimitIPAndEmail, rateLimitIP } = require("../middlewares/rateLimit.middleware");

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
  "/login",
  rateLimitIPAndEmail(),                    // anti brute-force
  validate(schemas.login),
  authController.login
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Envoie un email de réinitialisation de mot de passe
 *     tags: [Auth]
 */
router.post(
  "/forgot-password",
  rateLimitIPAndEmail(),
  validate(schemas.forgotPassword),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  rateLimitIP(),
  validate(schemas.resetPassword),
  authController.resetPassword
);

module.exports = router;
