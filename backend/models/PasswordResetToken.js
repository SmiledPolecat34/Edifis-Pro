const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Table des jetons de réinitialisation de mot de passe
 * - token_hash: SHA-256 du token brut (le token brut n'est jamais stocké)
 * - expires_at: date d'expiration (TTL)
 * - used_at: date d'utilisation (null si non utilisé)
 * - ip / user_agent: méta pour audit
 * - user_id: FK vers users.user_id
 */
const PasswordResetToken = sequelize.define(
  'password_reset_tokens',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(64), // SHA-256 hex
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45), // IPv6 max
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token_hash'], unique: true },
      { fields: ['expires_at'] },
    ],
  },
);

module.exports = PasswordResetToken;
