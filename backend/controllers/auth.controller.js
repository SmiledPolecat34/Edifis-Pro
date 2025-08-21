const crypto = require("crypto");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { User, PasswordResetToken } = require("../models");
const { sendMail } = require("../services/email.service");
const { hash: hashPassword } = require("../services/password.service");

const RESET_TOKEN_TTL_MINUTES = parseInt(process.env.RESET_TOKEN_TTL_MINUTES || "20", 10);

function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

// POST /api/auth/forgot-password
// Body: { email }
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Réponse générique (anti-énumération d&#39;utilisateurs)
        const genericResponse = {
            message:
                "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
        };

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        // Invalider les anciens tokens non utilisés (optionnel pour n&#39;avoir qu&#39;un token actif)
        await PasswordResetToken.destroy({
            where: {
                user_id: user.user_id,
                used_at: null,
            },
        });

        // Générer un token robuste (64 hex chars)
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = sha256Hex(rawToken);

        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

        await PasswordResetToken.create({
            user_id: user.user_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used_at: null,
            ip: req.ip || null,
            user_agent: req.headers["user-agent"] || null,
        });

        // Construire un lien (redirigé vers le frontend)
        const frontendBase =
            process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";
        const resetLink = `${frontendBase}/reset-password?token=${rawToken}&email=${encodeURIComponent(
            email
        )}`;

        // Envoyer l&#39;email (transport JSON en dev)
        await sendMail({
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe. Cliquez sur ce lien pour procéder (valide ${RESET_TOKEN_TTL_MINUTES} minutes):\n\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
            html: `<p>Bonjour,</p><p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a> (valide ${RESET_TOKEN_TTL_MINUTES} minutes).</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
        });

        return res.status(200).json(genericResponse);
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// POST /api/auth/reset-password
// Body: { token, newPassword, confirmNewPassword }
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const tokenHash = sha256Hex(token);

        const record = await PasswordResetToken.findOne({
            where: { token_hash: tokenHash },
        });

        if (!record) {
            return res.status(400).json({ message: "Token invalide" });
        }
        if (record.used_at) {
            return res.status(400).json({ message: "Token déjà utilisé" });
        }
        if (new Date(record.expires_at).getTime() < Date.now()) {
            return res.status(400).json({ message: "Token expiré" });
        }

        const user = await User.findByPk(record.user_id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const hashed = await hashPassword(newPassword);
        await user.update({ password: hashed });

        // Invalider le token après usage
        record.used_at = new Date();
        await record.save();

        // Optionnel: supprimer d&#39;autres tokens actifs de l&#39;utilisateur
        await PasswordResetToken.destroy({
            where: {
                user_id: user.user_id,
                used_at: null,
            },
        });

        return res.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
