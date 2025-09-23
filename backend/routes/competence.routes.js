const express = require('express');
const router = express.Router();
const competenceController = require('../controllers/competence.controller');
const { validate, schemas } = require('../middlewares/validator.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Validation middleware
const validateCreateCompetence = validate(schemas.createCompetence);
const validateUpdateCompetence = validate(schemas.updateCompetence);

const authorizedRoles = ['Admin', 'Manager', 'HR'];


/**
 * @swagger
 * tags:
 *   name: Competences
 *   description: Gestion des compétences
 */

/**
 * @swagger
 * /api/competences:
 *   post:
 *     summary: Créer une nouvelle compétence
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Competence'
 *     responses:
 *       201:
 *         description: Compétence créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 */
router.post(
  '/',
  protect,
  authorize(authorizedRoles),
  validateCreateCompetence,
  competenceController.createCompetence,
);

/**
 * @swagger
 * /api/competences:
 *   get:
 *     summary: Récupérer toutes les compétences
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 */
router.get('/', protect, authorize(authorizedRoles), competenceController.getAllCompetences);

/**
 * @swagger
 * /api/competences/{id}:
 *   get:
 *     summary: Récupérer une compétence par son ID
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la compétence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 *       404:
 *         description: Compétence non trouvée
 */
router.get('/:id', protect, authorize(authorizedRoles), competenceController.getCompetenceById);

/**
 * @swagger
 * /api/competences/{id}:
 *   put:
 *     summary: Mettre à jour une compétence
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la compétence
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Competence'
 *     responses:
 *       200:
 *         description: Compétence mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 *       404:
 *         description: Compétence non trouvée
 */
router.put(
  '/:id',
  protect,
  authorize(authorizedRoles),
  validateUpdateCompetence,
  competenceController.updateCompetence,
);

/**
 * @swagger
 * /api/competences/{id}:
 *   delete:
 *     summary: Supprimer une compétence
 *     tags: [Competences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la compétence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compétence supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Interdit
 *       404:
 *         description: Compétence non trouvée
 */
router.delete('/:id', protect, authorize(authorizedRoles), competenceController.deleteCompetence);


module.exports = router;
