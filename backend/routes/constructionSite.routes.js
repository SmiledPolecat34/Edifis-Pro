const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/constructionSite.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload, setUploadType } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: ConstructionSites
 *   description: Gestion des chantiers
 */

/**
 * @swagger
 * /api/construction-sites:
 *   post:
 *     summary: Créer un nouveau chantier
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Chantier créé }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.post(
  '/',
  protect,
  setUploadType('construction'),
  upload.single('image'),
  (req, res, next) => {
    if (req.user && ['Admin', 'Manager'].includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Seul Admin/Manager peut créer' });
  },
  ctrl.createConstructionSite,
);

/**
 * @swagger
 * /api/construction-sites:
 *   get:
 *     summary: Récupérer tous les chantiers
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 */
router.get('/', protect, ctrl.getAllConstructionSites);

/**
 * @swagger
 * /api/construction-sites/{id}/users:
 *   get:
 *     summary: Récupérer les utilisateurs d'un chantier
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du chantier
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Chantier non trouvé }
 */
router.get('/:id/users', protect, ctrl.getUsersOfConstructionSite);

/**
 * @swagger
 * /api/construction-sites/{id}:
 *   get:
 *     summary: Récupérer un chantier par son ID
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du chantier
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: OK }
 *       401: { description: Non autorisé }
 *       404: { description: Chantier non trouvé }
 */
router.get('/:id', protect, ctrl.getConstructionSiteById);

/**
 * @swagger
 * /api/construction-sites/{id}:
 *   put:
 *     summary: Mettre à jour un chantier
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du chantier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConstructionSite'
 *     responses:
 *       200: { description: Chantier mis à jour }
 *       400: { description: Données invalides }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Chantier non trouvé }
 */
router.put(
  '/:id',
  protect,
  (req, res, next) => {
    if (req.user && ['Admin', 'Manager'].includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Seul Admin/Manager peut modifier' });
  },
  ctrl.updateConstructionSite,
);

/**
 * @swagger
 * /api/construction-sites/{id}:
 *   delete:
 *     summary: Supprimer un chantier
 *     tags: [ConstructionSites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du chantier
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Chantier supprimé }
 *       401: { description: Non autorisé }
 *       403: { description: Interdit }
 *       404: { description: Chantier non trouvé }
 */
router.delete(
  '/:id',
  protect,
  (req, res, next) => {
    if (req.user && req.user.role === 'Admin') return next();
    return res.status(403).json({ message: 'Seul Admin peut supprimer' });
  },
  ctrl.deleteConstructionSite,
);

module.exports = router;
