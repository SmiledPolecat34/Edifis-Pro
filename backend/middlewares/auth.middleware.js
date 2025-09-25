const jwt = require('jsonwebtoken');
const { User, Role, Task } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const protect = (req, res, next) => {
  try {
    // Vérification du token JWT
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ajout des informations de l'utilisateur à la requête
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    next();
  };
}

// Manager & Admin : peuvent gérer les users (mais pas Admin)
const canManageUsers = async (req, res, next) => {
  if (req.user.role === 'Admin') return next();
  if (req.user.role === 'Manager' || req.user.role === 'HR') {
    try {
      const target = await User.findByPk(req.params.id, {
        include: [{ model: Role, as: 'role' }],
      });
      if (!target) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      // Manager ne peut pas toucher Admin/Manager
      if (
        req.user.role === 'Manager' &&
        (target.role.name === 'Admin' || target.role.name === 'Manager')
      ) {
        return res.status(403).json({ message: 'Un Manager ne peut pas modifier Admin/Manager' });
      }
      return next();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(403).json({ message: 'Non autorisé' });
};

const ROLES = {
  Admin: 'Admin',
  Manager: 'Manager',
  HR: 'HR',
  Project_Chief: 'Project_Chief',
  Worker: 'Worker',
};

const roleHierarchy = {
  [ROLES.Admin]: 4,
  [ROLES.Manager]: 3,
  [ROLES.HR]: 2,
  [ROLES.Project_Chief]: 1,
  [ROLES.Worker]: 0,
};

const canUpdateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Le créateur de la tâche peut toujours modifier
    if (task.creator_id === req.user.id) {
      return next();
    }

    const requesterRoleLevel = roleHierarchy[req.user.role];

    const creator = await User.findByPk(task.creator_id, {
      include: [{ model: Role, as: 'role' }],
    });
    if (!creator) {
      // Should not happen
      return res.status(404).json({ message: 'Créateur de la tâche non trouvé' });
    }
    const creatorRoleLevel = roleHierarchy[creator.role.name];

    if (requesterRoleLevel < creatorRoleLevel) {
      return res.status(403).json({
        message:
          'Vous ne pouvez pas modifier une tâche créée par un utilisateur avec un rôle supérieur.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res
    .status(403)
    .json({ message: 'Accès non autorisé. Seuls les Admins peuvent effectuer cette action.' });
};

const isManager = (req, res, next) => {
  if (req.user && req.user.role === 'Manager') {
    return next();
  }
  return res
    .status(403)
    .json({ message: 'Accès non autorisé. Seuls les Managers peuvent effectuer cette action.' });
};

module.exports = { protect, authorize, canManageUsers, ROLES, canUpdateTask, isAdmin, isManager };
