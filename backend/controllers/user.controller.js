const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Task = require("../models/Task");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const Role = require("../models/Role");
const Competence = require("../models/Competence");
const { Op } = require("sequelize");
const { hash: hashPassword, compare: comparePassword, validatePolicy } = require("../services/password.service");
const logger = require("../config/logger");

// Récupérer tous les utilisateurs sauf ceux avec `role_id = 1` (Responsables)
// Inscription (Création de compte avec JWT)
exports.createUser = async (req, res) => {
    console.log("[HIT] POST /users/register (createUser)");
    console.log("body:", req.body);
    console.log("user from token:", req.user);
    try {
        // 1) Validation champs requis (conforme aux tests existants)
        const { firstname, lastname, email, role, numberphone, password, competences = [] } = req.body;
        let { role_id } = req.body;

        if (!firstname || !lastname || !email || !numberphone) {
            return res.status(400).json({ message: "Tous les champs sont requis, y compris le numéro de téléphone" });
        }

        // 2) Email unique
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // 3) Autorisation Admin
        const isAdminRole = (req.user && (req.user.role === "Admin" || req.user.role === 1));
        if (!isAdminRole) {
            return res.status(403).json({ message: "Accès refusé. Seul un Admin peut créer un utilisateur" });
        }

        // Determine role_id from role name if provided
        if (role && !role_id) {
            const roleInstance = await Role.findOne({ where: { name: role } });
            if (roleInstance) {
                role_id = roleInstance.role_id;
            } else {
                return res.status(400).json({ message: `Le rôle '${role}' n'est pas valide` });
            }
        }

        if (!role_id) {
            const defaultRole = await Role.findOne({ where: { name: 'Worker' } });
            if (defaultRole) {
                role_id = defaultRole.role_id;
            } else {
                return res.status(500).json({ message: "Le rôle par défaut 'Worker' est introuvable." });
            }
        }

        // 4) Détermination du mot de passe
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        } else {
            const plainPassword = process.env.DEFAULT_PASSWORD || "edifispr@2025";
            hashedPassword = await hashPassword(plainPassword);
        }

        // 5) Création
        const user = await User.create({
            firstname,
            lastname,
            email,
            role_id,
            numberphone,
            password: hashedPassword,
        });

        // Lier les compétences si présentes
        if (Array.isArray(competences) && competences.length && typeof user.setCompetences === "function") {
            const ids = competences.map(c => c.competence_id).filter(Boolean);
            if (ids.length) {
                await user.setCompetences(ids);
            }
        }

        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: { user_id: user.user_id, firstname: user.firstname }
        });
    } catch (error) {
        console.error("createUser:", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        await user.destroy();
        res.json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Connexion (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }

        // Find the user and include their role
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role', attributes: ['name'] }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Email ou Mot de passe incorrect" });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou Mot de passe incorrect" });
        }

        // Get the role name from the included association
        const roleName = user.role ? user.role.name : 'Worker';


        const token = jwt.sign(
            { userId: user.user_id, role: roleName },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );


        res.json({ message: "Connexion réussie", token, user: { id: user.user_id, email: user.email, role: roleName } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les utilisateurs (sans afficher le mot de passe)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture"],
            include: [
                { model: Role, as: "role", attributes: ["name"] },
                { model: Competence, as: "competences", attributes: ["name"], through: { attributes: [] } }
            ]
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllWorkers = async (req, res) => {
    try {
        const workers = await User.findAll({
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["name"]
                }
            ],
            where: { role_id: 2 } // 2 = Worker
        });

        // Normaliser la réponse
        const formatted = workers.map(w => ({
            user_id: w.user_id,
            firstname: w.firstname,
            lastname: w.lastname,
            email: w.email,
            numberphone: w.numberphone,
            profile_picture: w.profile_picture,
            role: w.role?.name || "Worker"
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Erreur getAllWorkers:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


// Récupérer tous les chefs de projet (utilisateurs avec `role = Manager`)
exports.getAllManagers = async (req, res) => {
    try {
        const managers = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture"],
            where: {
                role_id: 3 // 3 = Manager
            }
        });

        res.json(managers);
    } catch (error) {
        console.error("Erreur lors de la récupération des chefs de projet :", error);
        res.status(500).json({ error: error.message });
    }
};


// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                { model: Role, as: "role", attributes: ["role_id", "name"] }
            ]
        });

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// util: resolve role name -> role_id
async function resolveRoleIdByName(roleName) {
    if (!roleName) return null;
    const found = await Role.findOne({ where: { name: roleName } });
    return found ? found.role_id : null;
}

// util: get role ids map { Admin: 7, Manager: 8, Worker: 9, ... }
async function getRoleIds() {
    const rows = await Role.findAll({ attributes: ["role_id", "name"] });
    const map = {};
    for (const r of rows) map[r.name] = r.role_id;
    return map;
}

// Mettre à jour un utilisateur (avec hash si le mdp est modifié)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role, as: "role", attributes: ["name", "role_id"] }],
        });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const payload = { ...req.body }; // Copie des données du corps de la requête

        // Si rôle envoyé par NOM -> map vers role_id
        if (payload.role && !payload.role_id) {
            const role = await Role.findOne({ where: { name: payload.role } });
            if (!role) return res.status(400).json({ message: `Rôle '${payload.role}' invalide` });
            payload.role_id = role.role_id;
            delete payload.role;
        }

        // Hash si password présent
        if (payload.password) {
            payload.password = await hashPassword(payload.password);
        }

        // Sauvegarde des champs simples
        await user.update(payload);

        // Gestion des compétences (si un tableau est envoyé)
        // accepte soit [{competence_id,...}], soit [id1, id2, ...]
        if (Array.isArray(req.body.competences)) {
            let ids = [];
            if (req.body.competences.length > 0 && typeof req.body.competences[0] === "object") {
                ids = req.body.competences.map(c => c.competence_id).filter(Boolean);
            } else {
                ids = req.body.competences.map(Number).filter(Boolean);
            }
            if (typeof user.setCompetences === "function") {
                await user.setCompetences(ids);
            }
        }

        // Retour avec rôle (nom)
        const updated = await User.findByPk(user.user_id, {
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture"],
            include: [
                { model: Role, as: "role", attributes: ["name"] },
                { model: Competence, as: "competences", attributes: ["competence_id", "name"], through: { attributes: [] } }
            ],
        });

        return res.json({
            message: "Utilisateur mis à jour",
            user: {
                user_id: updated.user_id,
                firstname: updated.firstname,
                lastname: updated.lastname,
                email: updated.email,
                numberphone: updated.numberphone,
                profile_picture: updated.profile_picture,
                role: updated.role?.name || null,
                competences: updated.competences || []
            }
        });
    } catch (error) {
        console.error("updateUser:", error);
        return res.status(500).json({ error: error.message });
    }
};
// >>> LISTE filtrée selon le rôle du demandeur
exports.getDirectory = async (req, res) => {
    try {
        const me = req.user?.role;

        let whereRole = {};
        if (me === "Admin") {
            // rien : tous
        } else if (me === "HR" || me === "Manager") {
            // tout le monde sauf Admin
            const adminRole = await Role.findOne({ where: { name: "Admin" } });
            if (adminRole) whereRole = { role_id: { [Op.ne]: adminRole.role_id } };
        } else if (me === "Project_Chief" || me === "Worker") {
            // uniquement Workers
            const workerRole = await Role.findOne({ where: { name: "Worker" } });
            if (workerRole) whereRole = { role_id: workerRole.role_id };
        }

        const users = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture", "role_id"],
            where: whereRole,
            include: [
                { model: Role, as: "role", attributes: ["name"] },
                { model: Competence, as: "competences", attributes: ["competence_id", "name"], through: { attributes: [] } }
            ],
            order: [["lastname", "ASC"], ["firstname", "ASC"]],
        });

        const out = users.map(u => ({
            user_id: u.user_id,
            firstname: u.firstname,
            lastname: u.lastname,
            email: u.email,
            numberphone: u.numberphone,
            profile_picture: u.profile_picture,
            role: u.role?.name || null,
            competences: u.competences || []
        }));

        return res.json(out);
    } catch (err) {
        console.error("getDirectory:", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};


// Mettre à jour l’image de profil
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image envoyée" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Supprimer l'ancienne image si elle existe
        if (user.profile_picture) {
            const oldImagePath = path.join(__dirname, "../uploads/profile_pictures", user.profile_picture);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Mettre à jour l'utilisateur avec la nouvelle image
        user.profile_picture = req.file.filename;
        await user.save();

        res.json({ message: "Image de profil mise à jour avec succès", profile_picture: user.profile_picture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        await user.destroy();
        res.json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/users/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const userId = req.user?.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            return res.status(400).json({ message: "Mot de passe actuel incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashed });

        return res.json({ message: "Mot de passe mis à jour" });
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// Helpers simples pour normaliser le prénom/nom
function slugifyName(s = "") {
    return s
        .normalize("NFD")                    // supprime les accents
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9- ]/g, "")      // garde lettres/chiffres/espaces/tirets
        .trim()
        .replace(/\s+/g, ".")                // espaces -> point (au cas où)
        .toLowerCase();
}

exports.suggestEmail = async (req, res) => {
    try {
        const { firstname = "", lastname = "" } = req.query;

        const first = slugifyName(firstname);
        const last = slugifyName(lastname);
        if (!first) {
            return res.status(400).json({ message: "firstname requis" });
        }

        const localPartBase = last ? `${first}.${last}` : first;
        const domain = "edifis-pro.com";

        // On récupère tous les emails qui commencent par localPartBase
        // (ex: pierre.benoit@..., pierre.benoit2@..., pierre.benoit10@...)
        const likePrefix = `${localPartBase}%@${domain}`;
        const existing = await User.findAll({
            attributes: ["email"],
            where: { email: { [Op.like]: likePrefix } },
        });

        // Cherche le plus petit suffixe dispo (base, base2, base3, …)
        const used = new Set(
            existing.map(u => {
                const m = u.email.match(new RegExp(`^${localPartBase}(\\d+)?@${domain}`))
                // m[1] contient le nombre si présent
                return m && m[1] ? parseInt(m[1], 10) : 0; // 0 = sans suffixe
            })
        );

        let candidate = `${localPartBase}@${domain}`;
        if (used.has(0)) {
            // base déjà pris, on teste 2,3,4…
            let n = 2;
            while (used.has(n)) n++;
            candidate = `${localPartBase}${n}@${domain}`;
        }

        return res.json({ email: candidate });
    } catch (err) {
        console.error("suggestEmail:", err);
        return res.status(500).json({ error: "Erreur lors de la génération de l'email" });
    }
};

exports.assignCompetenceToUser = async (req, res) => {
    try {
        const { userId, competenceId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const competence = await Competence.findByPk(competenceId);
        if (!competence) {
            return res.status(404).json({ message: "Compétence non trouvée" });
        }

        await user.addCompetence(competence);

        res.json({ message: "Compétence assignée avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'assignation de la compétence :", error);
        res.status(500).json({ error: error.message });
    }
};