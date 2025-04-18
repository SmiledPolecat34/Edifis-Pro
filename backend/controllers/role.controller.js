const Role = require("../models/Role");

// Créer un rôle
exports.createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Mettre à jour un rôle
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: "Rôle non trouvé" });
    await role.update(req.body);
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un rôle
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: "Rôle non trouvé" });
    await role.destroy();
    res.json({ message: "Rôle supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
