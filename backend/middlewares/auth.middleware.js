const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

// Vérifie si Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Accès réservé à l’Admin" });
    }
    next();
};

// Vérifie si Manager
const isManager = (req, res, next) => {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Accès réservé aux Managers" });
    }
    next();
};

// Vérifie si RH
const isHR = (req, res, next) => {
    if (req.user.role !== "HR") {
        return res.status(403).json({ message: "Accès réservé aux RH" });
    }
    next();
};

// Manager & Admin : peuvent gérer les users (mais pas Admin)
const canManageUsers = async (req, res, next) => {
    if (req.user.role === "Admin") return next();
    if (req.user.role === "Manager" || req.user.role === "HR") {
        try {
            const target = await User.findByPk(req.params.id, {
                include: [{ model: Role, as: "role" }]
            });
            if (!target) return res.status(404).json({ message: "Utilisateur non trouvé" });

            // Manager ne peut pas toucher Admin/Manager
            if (req.user.role === "Manager" && (target.role.name === "Admin" || target.role.name === "Manager")) {
                return res.status(403).json({ message: "Un Manager ne peut pas modifier Admin/Manager" });
            }
            return next();
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    return res.status(403).json({ message: "Non autorisé" });
};

module.exports = { protect, isAdmin, isManager, isHR, canManageUsers };
