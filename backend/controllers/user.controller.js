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

// Connexion (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user.user_id, role: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les utilisateurs (sans afficher le mot de passe)
// exports.getAllUsers = async (req, res) => {
//     try {
//         const users = await User.findAll({
//             attributes: { exclude: ["password"] }
//         });
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };




// Récupérer tous les utilisateurs sauf ceux avec `role_id = 1` (Responsables)
// Inscription (Création de compte avec JWT)
exports.createUser = async (req, res) => {
    console.log("[HIT] POST /users/register (createUser)");
    console.log("body:", req.body);
    console.log("user from token:", req.user);
    try {
        // Seul un Admin peut créer un utilisateur (adapté à ton projet)
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Accès refusé. Seul un Admin peut créer un utilisateur" });
        }

        const { firstname, lastname, email, role, numberphone, competences = [] } = req.body;

        if (!firstname || !lastname || !email || !role || !numberphone) {
            return res.status(400).json({ message: "firstname, lastname, email, role, numberphone requis" });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // 1) Mot de passe généré côté serveur
        const plainPassword = process.env.DEFAULT_PASSWORD || "edifispr@2025";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // 2) Création
        const user = await User.create({
            firstname,
            lastname,
            email,
            role,
            numberphone,
            password: hashedPassword,
        });

        // 3) Lier les compétences si tu utilises une table de jointure
        if (Array.isArray(competences) && competences.length) {
            // competences = [{ competence_id, name, ... }]
            const ids = competences.map(c => c.competence_id).filter(Boolean);
            if (ids.length) {
                await user.setCompetences(ids);
            }
        }

        // 4) NE PAS renvoyer le hash. On renvoie un "tempPassword" pour affichage ponctuel
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: {
                user_id: user.user_id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                numberphone: user.numberphone,
            },
            tempPassword: plainPassword,
        });
    } catch (error) {
        console.error("createUser:", error);
        return res.status(500).json({ error: error.message });
    }
}

// ---------- UPDATE / DELETE ----------
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        await user.update(req.body);
        res.json({ message: "Utilisateur mis à jour", user });
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

// Connexion (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Email ou Mot de passe incorrect" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les utilisateurs sauf ceux avec `role = Admin`
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture", "role"],
            where: {
                role: { [Op.ne]: "Admin" } // Exclure les Admins
            },
            include: [
                {
                    model: Competence,
                    attributes: ["name"],
                    through: { attributes: [] }
                },
                {
                    model: Task,
                    attributes: ["task_id", "description", "start_date", "end_date"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!users.length) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé (hors Admins)" });
        }

        res.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllWorkers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                "user_id",
                "firstname",
                "lastname",
                "email",
                "numberphone",
                "profile_picture",
                "role"
            ],
            where: { role: "Worker" },
            include: [
                {
                    model: Competence,
                    attributes: ["name"],
                    through: { attributes: [] }
                },
                {
                    model: Task,
                    attributes: ["task_id", "description", "start_date", "end_date"],
                    through: { attributes: [] }
                }
            ]
        });
        return res.json(users);
    } catch (error) {
        console.error("getAllWorkers:", error);
        return res.status(500).json({ error: error.message });
    }
};


// Récupérer tous les chefs de projet (utilisateurs avec `role = Manager`)
exports.getAllManagers = async (req, res) => {
    try {
        const managers = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture", "role"],
            where: {
                role: "Manager" // Inclure uniquement les Managers
            },
            include: [
                {
                    model: Competence,
                    attributes: ["name"],
                    through: { attributes: [] }
                }
            ]
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
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Competence,
                    attributes: ["name"],
                    through: { attributes: [] }
                }
            ]
        });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un utilisateur (avec hash si le mdp est modifié)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const { firstname, lastname, email, password, role } = req.body;

        if (password) {
            req.body.password = await bcrypt.hash(password, 10);
        }

        await user.update(req.body);
        res.json({ message: "Utilisateur mis à jour", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
        }

        const userId = req.user?.userId; // rempli par ton middleware protect
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
        console.error("changePassword:", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// Helpers simples pour normaliser le prénom/nom
function slugifyName(s = "") {
    return s
        .normalize("NFD")                    // supprime les accents
        .replace(/[\u0300-\u036f]/g, "")
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
                const m = u.email.match(new RegExp(`^${localPartBase}(\\d+)?@${domain}$`));
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


console.log(process.env.JWT_SECRET);
console.log(process.env.JWT_EXPIRES_IN);