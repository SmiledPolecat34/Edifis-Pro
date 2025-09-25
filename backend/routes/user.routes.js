const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, isAdmin, canManageUsers } = require('../middlewares/auth.middleware');
const { upload, setUploadType } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201: { description: Utilisateur créé }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.post(
  '/',
  protect,
  (req, res, next) => {
    if (['Admin', 'HR', 'Manager'].includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Accès interdit' });
  },
  userController.createUser,
);

/**
 * @swagger
 * /api/users/project-chiefs:
 *   get:
 *     summary: Récupérer tous les chefs de projet
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 */
router.get('/project-chiefs', protect, userController.getAllProjectChiefs);

/**
 * @swagger
 * /api/users/assignable-to-task:
 *   get:
 *     summary: Récupérer les utilisateurs assignables à une tâche
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 */
router.get('/assignable-to-task', protect, userController.getAssignableUsers);

/**
 * @swagger
 * /api/users/list:
 *   get:
 *     summary: Récupérer la liste des utilisateurs (annuaire)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 */
router.get('/list', protect, userController.getDirectory);

/**
 * @swagger
 * /api/users/getallworkers:
 *   get:
 *     summary: Récupérer tous les ouvriers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.get('/getallworkers', protect, isAdmin, userController.getAllWorkers);

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Récupérer tous les utilisateurs (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.get('/all', protect, isAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/suggest-email:
 *   get:
 *     summary: Suggérer un email pour un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 */
router.get('/suggest-email', protect, userController.suggestEmail);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Utilisateur non trouvé }
 */
router.get('/:id', protect, userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200: { description: Utilisateur mis à jour }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Utilisateur non trouvé }
 */
router.put('/:id', protect, canManageUsers, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Utilisateur supprimé }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Utilisateur non trouvé }
 */
router.delete('/:id', protect, canManageUsers, userController.deleteUser);

/**
 * @swagger
 * /api/users/upload-profile:
 *   post:
 *     summary: Mettre à jour la photo de profil d'un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture: { type: string, format: binary }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 */
router.post(
  '/upload-profile',
  protect,
  setUploadType('profile'),
  upload.single('profilePicture'),
  userController.updateProfilePicture,
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Changer le mot de passe d'un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Utilisateur non trouvé }
 */
router.post('/change-password', protect, userController.changePassword);

module.exports = router;
