const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validate, schemas } = require("../middlewares/validator.middleware");
const { rateLimitIPAndEmail, rateLimitIP } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Envoie un email de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'email de l'utilisateur qui a oublié son mot de passe.
 *     responses:
 *       200:
 *         description: "Email de réinitialisation envoyé avec succès."
 *       400:
 *         description: "Erreur de validation (ex: email invalide)."
 *       404:
 *         description: "Aucun utilisateur trouvé avec cet email."
 */
// Mot de passe oublié
router.post(
  "/forgot-password",
  rateLimitIPAndEmail(),              // limite par IP + email
  validate(schemas.forgotPassword),   // valide { email }
  authController.forgotPassword
);

// Réinitialisation du mot de passe
router.post(
  "/reset-password",
  rateLimitIP(),                      // limite par IP
  validate(schemas.resetPassword),    // valide { token, newPassword, confirmNewPassword }
  authController.resetPassword
);

module.exports = router;
