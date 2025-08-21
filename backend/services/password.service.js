const bcrypt = require("bcrypt");

/**
 * Service de mots de passe
 * - Centralise les opérations de hash/compare
 * - Fournit une validation de politique (OWASP-like)
 */

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

/**
 * Valide la politique de mot de passe:
 * - min 12
 * - au moins 1 maj, 1 min, 1 chiffre, 1 spécial
 */
function validatePolicy(password = "") {
    const result = {
        ok: true,
        errors: [],
    };
    if (password.length < 12) {
        result.ok = false;
        result.errors.push("Le mot de passe doit contenir au moins 12 caractères");
    }
    if (!/[A-Z]/.test(password)) {
        result.ok = false;
        result.errors.push("Le mot de passe doit contenir au moins une majuscule");
    }
    if (!/[a-z]/.test(password)) {
        result.ok = false;
        result.errors.push("Le mot de passe doit contenir au moins une minuscule");
    }
    if (!/[0-9]/.test(password)) {
        result.ok = false;
        result.errors.push("Le mot de passe doit contenir au moins un chiffre");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        result.ok = false;
        result.errors.push("Le mot de passe doit contenir au moins un caractère spécial");
    }
    return result;
}

async function hash(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function compare(plain, hashed) {
    return bcrypt.compare(plain, hashed);
}

module.exports = {
    validatePolicy,
    hash,
    compare,
};
