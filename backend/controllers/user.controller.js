const sequelize = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const Role = require('../models/Role');
const Competence = require('../models/Competence');
const { Op } = require('sequelize');
const {
  hash: hashPassword,
  compare: comparePassword,
  validatePolicy,
} = require('../services/password.service');
const logger = require('../config/logger');

// Récupérer tous les utilisateurs sauf ceux avec `role_id = 1` (Responsables)
// Inscription (Création de compte avec JWT)
exports.createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, numberphone, role, role_id } = req.body;

    // Validation simple
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être fournis' });
    }

    let final_role_id = role_id;

    if (role && !final_role_id) {
      const role_obj = await Role.findOne({ where: { name: role } });
      if (!role_obj) {
        return res.status(400).json({ message: `Le rôle '${role}' n'est pas valide.` });
      }
      final_role_id = role_obj.role_id;
    }

    if (!final_role_id) {
      final_role_id = 2; // Default to 'Worker'
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      numberphone,
      role_id: final_role_id,
    });

    // Ne pas renvoyer le mot de passe
    const userResponse = {
      user_id: newUser.user_id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      numberphone: newUser.numberphone,
      role_id: newUser.role_id,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "L'email existe déjà" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer tous les utilisateurs (sans afficher le mot de passe)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'firstname', 'lastname', 'email', 'numberphone', 'profile_picture'],
      include: [
        { model: Role, as: 'role', attributes: ['name'] },
        { model: Competence, as: 'competences', attributes: ['name', 'description'], through: { attributes: [] } },
      ],
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
          as: 'role',
          attributes: ['name'],
        },
      ],
      where: { role_id: 2 }, // 2 = Worker
    });

    // Normaliser la réponse
    const formatted = workers.map(w => ({
      user_id: w.user_id,
      firstname: w.firstname,
      lastname: w.lastname,
      email: w.email,
      numberphone: w.numberphone,
      profile_picture: w.profile_picture,
      role: w.role?.name || 'Worker',
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les chefs de projet (utilisateurs avec `role = Manager`)
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      attributes: ['user_id', 'firstname', 'lastname', 'email', 'numberphone', 'profile_picture'],
      where: {
        role_id: 3, // 3 = Manager
      },
    });

    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjectChiefs = async (req, res) => {
  try {
    // Find the role IDs for Manager and Project_Chief
    const projectChiefRoles = await Role.findAll({
      where: {
        name: {
          [Op.in]: ['Manager', 'Project_Chief'],
        },
      },
      attributes: ['role_id'],
    });

    const roleIds = projectChiefRoles.map(role => role.role_id);

    if (roleIds.length === 0) {
      return res.json([]);
    }

    const chiefs = await User.findAll({
      attributes: ['user_id', 'firstname', 'lastname', 'email'],
      where: { role_id: { [Op.in]: roleIds } },
    });

    res.json(chiefs);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role', attributes: ['role_id', 'name'] },
        {
          model: Competence,
          as: 'competences',
          attributes: ['competence_id', 'name', 'description'],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
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
  const rows = await Role.findAll({ attributes: ['role_id', 'name'] });
  const map = {};
  for (const r of rows) map[r.name] = r.role_id;
  return map;
}

// Mettre à jour un utilisateur (avec hash si le mdp est modifié)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role', attributes: ['name', 'role_id'] }],
    });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const { competences, ...payload } = req.body;

    if (payload.role && !payload.role_id) {
      const role = await Role.findOne({ where: { name: payload.role } });
      if (!role) {
        return res.status(400).json({ message: `Rôle '${payload.role}' invalide` });
      }
      payload.role_id = role.role_id;
      delete payload.role;
    }

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }

    await user.update(payload);

    if (Array.isArray(competences)) {
      if (typeof user.setCompetences === 'function') {
        await user.setCompetences(competences);
      }
    }

    const updated = await User.findByPk(user.user_id, {
      attributes: ['user_id', 'firstname', 'lastname', 'email', 'numberphone', 'profile_picture'],
      include: [
        { model: Role, as: 'role', attributes: ['name'] },
        {
          model: Competence,
          as: 'competences',
          attributes: ['competence_id', 'name', 'description'],
          through: { attributes: [] },
        },
      ],
    });

    return res.json({
      message: 'Utilisateur mis à jour',
      user: {
        user_id: updated.user_id,
        firstname: updated.firstname,
        lastname: updated.lastname,
        email: updated.email,
        numberphone: updated.numberphone,
        profile_picture: updated.profile_picture,
        role: updated.role?.name || null,
        competences: updated.competences || [],
      },
    });
  } catch (error) {
    logger.error('Update user error:', { message: error.message, stack: error.stack });
    return res.status(500).json({ error: error.message });
  }
};
// >>> LISTE filtrée selon le rôle du demandeur
exports.getDirectory = async (req, res) => {
  try {
    const Role = require('../models/Role');
    const User = require('../models/User');
    const Competence = require('../models/Competence');

    const meRole = req.user?.role; // "Admin", "HR", "Manager", "Project_Chief", "Worker"

    // Politique d’affichage :
    // - Admin: tout le monde
    // - HR: tout le monde
    // - Manager/Project_Chief: seulement les Workers
    // - Worker: seulement lui-même
    let where = {};
    if (meRole === 'Manager' || meRole === 'Project_Chief') {
      const workerRole = await Role.findOne({ where: { name: 'Worker' } });
      where = { role_id: workerRole?.role_id || -1 };
    } else if (meRole === 'Worker') {
      where = { user_id: req.user.userId };
    } // Admin/HR => pas de filtre

    const users = await User.findAll({
      where,
      attributes: [
        'user_id',
        'firstname',
        'lastname',
        'email',
        'numberphone',
        'profile_picture',
        'role_id',
      ],
      include: [
        { model: Role, as: 'role', attributes: ['name'] },
        {
          model: Competence,
          as: 'competences',
          attributes: ['competence_id', 'name', 'description'],
          through: { attributes: [] },
        },
      ],
      order: [
        ['lastname', 'ASC'],
        ['firstname', 'ASC'],
      ],
    });

    const normalized = users.map(u => ({
      ...u.toJSON(),
      role: u.role?.name || 'User',
    }));

    res.json(normalized);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour l’image de profil
exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image envoyée' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancienne image si elle existe
    if (user.profile_picture) {
      const oldImagePath = path.join(
        __dirname,
        '../uploads/profile_pictures',
        user.profile_picture,
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour l'utilisateur avec la nouvelle image
    user.profile_picture = req.file.filename;
    await user.save();

    res.json({
      message: 'Image de profil mise à jour avec succès',
      profile_picture: user.profile_picture,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    return res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Helpers simples pour normaliser le prénom/nom
function slugifyName(s = '') {
  return s
    .normalize('NFD') // supprime les accents
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9- ]/g, '') // garde lettres/chiffres/espaces/tirets
    .trim()
    .replace(/\s+/g, '.') // espaces -> point (au cas où)
    .toLowerCase();
}

exports.suggestEmail = async (req, res) => {
  try {
    const { firstname = '', lastname = '' } = req.body;

    const first = slugifyName(firstname);
    const last = slugifyName(lastname);
    if (!first) {
      return res.status(400).json({ message: 'firstname requis' });
    }

    const localPartBase = last ? `${first}.${last}` : first;
    const domain = 'edifis-pro.com';
    const finalLocalPart = localPartBase.replace(/\s/g, '');

    // On récupère tous les emails qui commencent par localPartBase
    // (ex: pierre.benoit@..., pierre.benoit2@..., pierre.benoit10@...)
    const likePrefix = `${finalLocalPart}%@${domain}`;
    const existing = await User.findAll({
      attributes: ['email'],
      where: { email: { [Op.like]: likePrefix } },
    });

    // Cherche le plus petit suffixe dispo (base, base2, base3, …)
    const used = new Set(
      existing.map(u => {
        const m = u.email.match(new RegExp(`^${finalLocalPart}(\d+)?@${domain}`));
        // m[1] contient le nombre si présent
        return m && m[1] ? parseInt(m[1], 10) : 0; // 0 = sans suffixe
      }),
    );

    let candidate = `${finalLocalPart}@${domain}`;
    if (used.has(0)) {
      // base déjà pris, on teste 2,3,4…
      let n = 2;
      while (used.has(n)) n++;
      candidate = `${finalLocalPart}${n}@${domain}`;
    }

    return res.json({ email: candidate });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la génération de l'email" });
  }
};

exports.assignCompetenceToUser = async (req, res) => {
  try {
    const { userId, competenceId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const competence = await Competence.findByPk(competenceId);
    if (!competence) {
      return res.status(404).json({ message: 'Compétence non trouvée' });
    }

    await user.addCompetence(competence);

    res.json({ message: 'Compétence assignée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignableUsers = async (req, res) => {
  try {
    const requesterRole = req.user.role;
    let rolesToFetch = [];

    if (requesterRole === 'Project_Chief') {
      rolesToFetch = ['Worker'];
    } else if (requesterRole === 'Manager') {
      rolesToFetch = ['Worker', 'Project_Chief', 'HR'];
    } else if (requesterRole === 'Admin') {
      // Admin can see everyone
    } else {
      // Other roles see no one for now
      return res.json([]);
    }

    let whereClause = {};
    if (rolesToFetch.length > 0) {
      const roles = await Role.findAll({
        where: { name: { [Op.in]: rolesToFetch } },
        attributes: ['role_id'],
      });
      const roleIds = roles.map(r => r.role_id);
      whereClause.role_id = { [Op.in]: roleIds };
    }

    const users = await User.findAll({
      where: whereClause,
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: ['user_id', 'firstname', 'lastname', 'email'],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
