const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validate, schemas } = require("../middlewares/validator.middleware");
const { rateLimitIPAndEmail, rateLimitIP } = require("../middlewares/rateLimit.middleware");

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
