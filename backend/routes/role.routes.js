const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");
const { protect } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestion des rôles
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Récupérer tous les rôles
 *     tags: [Roles]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", roleController.getRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un nouveau rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201: { description: Rôle créé }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 */
router.post("/", protect, roleController.createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Mettre à jour un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du rôle
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200: { description: Rôle mis à jour }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       404: { description: Rôle non trouvé }
 */
router.put("/:id", protect, roleController.updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du rôle
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Rôle supprimé }
 *       401: { description: Non autorisé }
 *       404: { description: Rôle non trouvé }
 */
router.delete("/:id", protect, roleController.deleteRole);

module.exports = router;
