const crypto = require("crypto");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, PasswordResetToken, Role, Setting } = require("../models");
const { sendMail } = require("../services/email.service");
const { hash: hashPassword, validatePolicy } = require("../services/password.service");

const RESET_TOKEN_TTL_MINUTES = parseInt(process.env.RESET_TOKEN_TTL_MINUTES || "20", 10);

function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, numberphone } = req.body;

        if (!email || !password || !firstname || !lastname || !role || !numberphone) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const passwordPolicy = validatePolicy(password);
        if (!passwordPolicy.ok) {
            return res.status(400).json({ message: "Le mot de passe ne respecte pas les critères de sécurité", errors: passwordPolicy.errors });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
        }

        const roleInstance = await Role.findOne({ where: { name: role } });
        if (!roleInstance) {
            return res.status(400).json({ message: "Le rôle spécifié n'existe pas" });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role_id: roleInstance.role_id,
            numberphone,
        });

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: {
                id: newUser.user_id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                roleId: newUser.role_id,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        // Maintenance mode check
        const maintenanceSetting = await Setting.findOne({ where: { key: 'maintenance_mode' } });
        const isMaintenance = maintenanceSetting && maintenanceSetting.value === 'true';

        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }

        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: "role" }],
        });

        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        // If in maintenance, only allow Admins to log in
        if (isMaintenance && user.role?.name !== 'Admin') {
            return res.status(403).json({ message: "Le site est actuellement en maintenance. Veuillez réessayer plus tard." });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        const roleName = user.role?.name ?? 'Worker';
        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: roleName },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: roleName,
                role_id: user.role_id,
            },
        });
    } catch (e) {
        console.error("--- LOGIN ERROR ---", e);
        return res.status(500).json({ message: "Erreur serveur inattendue" });
    }
};



// POST /api/auth/forgot-password
// Body: { email }
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Réponse générique (anti-énumération d'utilisateurs)
        const genericResponse = {
            message: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
        };

        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: "role" }],
        });

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        // Invalider les anciens tokens non utilisés
        await PasswordResetToken.destroy({
            where: { user_id: user.user_id, used_at: null },
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
        const frontendBase = process.env.FRONTEND_URL?.replace(/\$/, "") || "http://localhost:5174";
        const resetLink = `${frontendBase}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

        // Envoyer l'email
        await sendMail({
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe. Cliquez sur ce lien pour procéder (valide ${RESET_TOKEN_TTL_MINUTES} minutes):\n\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
            html: `<p>Bonjour,</p><p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a> (valide ${RESET_TOKEN_TTL_MINUTES} minutes).</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
        });

        return res.status(200).json(genericResponse);
    } catch (err) {
        console.error("--- FORGOT PASSWORD ERROR ---", err);
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

        // Optionnel: supprimer d'autres tokens actifs de l'utilisateur
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