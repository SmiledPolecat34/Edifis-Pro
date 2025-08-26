const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller.js');
const { protect, isAdmin } = require('../middlewares/auth.middleware.js');

// Toutes les routes de gestion des rôles sont protégées et réservées aux administrateurs.

// POST /api/roles - Créer un nouveau rôle
router.post('/', protect, isAdmin, roleController.createRole);

// GET /api/roles - Récupérer tous les rôles
router.get('/', protect, isAdmin, roleController.getAllRoles);

// GET /api/roles/:id - Récupérer un rôle par son ID
router.get('/:id', protect, isAdmin, roleController.getRoleById);

// PUT /api/roles/:id - Mettre à jour un rôle
router.put('/:id', protect, isAdmin, roleController.updateRole);

// DELETE /api/roles/:id - Supprimer un rôle
router.delete('/:id', protect, isAdmin, roleController.deleteRole);

module.exports = router;
