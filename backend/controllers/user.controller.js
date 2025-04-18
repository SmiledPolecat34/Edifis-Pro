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

// Inscription (Création de compte avec JWT)
exports.createUser = async (req, res) => {
    try {
        // Seul un Responsable (role_id = 1) peut créer un utilisateur
        if (req.user.role !== 1) {
            return res.status(403).json({ message: "Accès refusé. Seul un Responsable peut créer un utilisateur" });
        }

        const { firstname, lastname, email, password, role_id, numberphone } = req.body;

        // Vérifier que tous les champs sont fournis
        if (!firstname || !lastname || !email || !password || !role_id || !numberphone) {
            return res.status(400).json({ message: "Tous les champs sont requis, y compris le numéro de téléphone" });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Hacher le mot de passe avant l'insertion
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role_id,
            numberphone  // 👈 Ajout du champ numberphone
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", user });
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
    try {
        // Seul un Admin peut créer un utilisateur
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Accès refusé. Seul un Admin peut créer un utilisateur" });
        }

        const { firstname, lastname, email, password, role, numberphone } = req.body;

        // Vérifier que tous les champs sont fournis
        if (!firstname || !lastname || !email || !password || !role || !numberphone) {
            return res.status(400).json({ message: "Tous les champs sont requis, y compris le numéro de téléphone et le rôle" });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Hacher le mot de passe avant l'insertion
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur avec le rôle directement
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role,
            numberphone  // 👈 Ajout du champ numberphone
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", user });
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
        console.log(req.user.role);
        if (req.user.role !== "Admin" && req.user.role !== "Manager") {
            return res.status(403).json({ message: "Accès refusé. Seuls les Admins et Managers peuvent accéder à cette ressource" });
        }

        const users = await User.findAll({
            attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture", "role"],
            where: {
                role: { [Op.notIn]: ["Admin", "Manager"] } // Exclure les Admins et Managers
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

        if (!managers.length) {
            return res.status(404).json({ message: "Aucun chef de projet trouvé" });
        }

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

console.log(process.env.JWT_SECRET);
console.log(process.env.JWT_EXPIRES_IN);