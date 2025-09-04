// backend/controllers/role.controller.js
const Role = require("../models/Role");

// POST /api/roles
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name requis" });

    const exists = await Role.findOne({ where: { name } });
    if (exists) return res.status(400).json({ message: "Ce rôle existe déjà" });

    const role = await Role.create({ name });
    res.status(201).json(role);
  } catch (err) {
    console.error("[createRole] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error("❌ Erreur récupération rôles:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/roles/:id
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: "Rôle introuvable" });

    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name requis" });

    await role.update({ name });
    res.json(role);
  } catch (err) {
    console.error("[updateRole] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/roles/:id
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: "Rôle introuvable" });

    await role.destroy();
    res.json({ message: "Rôle supprimé" });
  } catch (err) {
    console.error("[deleteRole] error:", err);
    res.status(500).json({ error: err.message });
  }
};


// Récupérer tous les rôles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un rôle par ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: "Rôle non trouvé" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};