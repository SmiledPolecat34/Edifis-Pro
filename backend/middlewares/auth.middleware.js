const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Accès refusé. Token manquant" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};


// Middleware pour vérifier si l'utilisateur est Admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Accès refusé. Seul un Admin peut accéder à ces options." });
    }
    next();
};

// Middleware pour vérifier si l'utilisateur est Worker
const isWorker = (req, res, next) => {
    if (!req.user || req.user.role !== "Worker") {
        return res.status(403).json({ message: "Accès refusé. Seul un Worker peut accéder à ces options." });
    }
    next();
};

// Middleware pour vérifier si l'utilisateur est Manager
const isManager = (req, res, next) => {
    if (!req.user || req.user.role !== "Manager") {
        return res.status(403).json({ message: "Accès refusé. Seul un Manager peut accéder à ces options." });
    }
    next();
};

const checkAdminOrOwner = (req, res, next) => {
    const userIdFromToken = req.user?.userId; // ID extrait du token (cohérent avec le payload JWT)
    const userIdFromParams = req.params.id; // ID de la requête

    // Vérifie si l'utilisateur est un admin ou si l'ID correspond
    if (req.user?.role === "Admin" || String(userIdFromToken) === String(userIdFromParams)) {
        return next();
    }

    return res.status(403).json({ message: "Accès refusé. Seul un Admin ou le propriétaire du compte peut effectuer cette action." });
};

const User = require('../models/User');

const canManagerControl = async (req, res, next) => {
    // Si l'utilisateur est un Admin, il a tous les droits.
    if (req.user.role === 'Admin') {
        return next();
    }

    // Si l'utilisateur est un Manager, on vérifie la cible.
    if (req.user.role === 'Manager') {
        try {
            const targetUser = await User.findByPk(req.params.id);
            if (!targetUser) {
                return res.status(404).json({ message: "Utilisateur cible non trouvé" });
            }

            // Un Manager ne peut pas modifier un Admin ou un autre Manager.
            if (targetUser.role === 'Admin' || targetUser.role === 'Manager') {
                return res.status(403).json({ message: "Accès refusé: un Manager ne peut pas modifier un autre Manager ou un Admin." });
            }

            // Si la cible n'est ni Admin, ni Manager, le Manager a le droit.
            return next();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Si l'utilisateur n'est ni Admin ni Manager, il n'a pas le droit (sauf sur son propre profil, géré ailleurs).
    return res.status(403).json({ message: "Accès refusé." });
};

module.exports = { protect, isAdmin, isWorker, isManager, checkAdminOrOwner, canManagerControl };

