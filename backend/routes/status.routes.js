const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Status
 *   description: Gestion du statut de maintenance
 */

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get the current maintenance status of the site
 *     tags: [Status]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', statusController.getStatus);

/**
 * @swagger
 * /api/status/toggle:
 *   post:
 *     summary: Toggle maintenance mode on or off
 *     tags: [Status]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.post('/toggle', protect, isAdmin, statusController.toggleStatus);

module.exports = router;
