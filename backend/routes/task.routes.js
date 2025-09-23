const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { protect, isAdmin, isManager, authorize } = require('../middlewares/auth.middleware');


/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestion des tâches
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201: { description: Tâche créée }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.post('/', protect, isAdmin, taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Mettre à jour une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tâche
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200: { description: Tâche mise à jour }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Tâche non trouvée }
 */
router.put('/:id', protect, isAdmin, taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tâche
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Tâche supprimée }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Tâche non trouvée }
 */
router.delete('/:id', protect, isAdmin, taskController.deleteTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 */
router.get('/', protect, taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Récupérer une tâche par son ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tâche
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Tâche non trouvée }
 */
router.get('/:id', protect, taskController.getTaskById);

/**
 * @swagger
 * /api/tasks/assign:
 *   post:
 *     summary: Assigner des utilisateurs à une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId: { type: string }
 *               userIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Tâche ou utilisateur non trouvé }
 */
router.post(
  '/assign',
  protect,
  authorize(['Manager', 'Admin', 'Project_Chief']),
  taskController.assignUsersToTask,
);

/**
 * @swagger
 * /api/tasks/user/{userId}:
 *   get:
 *     summary: Récupérer les tâches d'un utilisateur
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Utilisateur non trouvé }
 */
router.get('/user/:userId', protect, taskController.getTasksByUserId);

/**
 * @swagger
 * /api/tasks/site/{siteId}:
 *   get:
 *     summary: Récupérer les tâches d'un chantier
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         description: ID du chantier
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Chantier non trouvé }
 */
router.get('/site/:siteId', protect, taskController.getTasksByConstructionSite);

module.exports = router;
