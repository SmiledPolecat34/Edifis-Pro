const express = require('express');
const router = express.Router();
const competenceController = require('../controllers/competence.controller');
const { validate, schemas } = require('../middlewares/validator.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Validation middleware
const validateCreateCompetence = validate(schemas.createCompetence);
const validateUpdateCompetence = validate(schemas.updateCompetence);

const authorizedRoles = ['Admin', 'Manager', 'HR'];

// Routes avec validation
router.post(
  '/',
  protect,
  authorize(authorizedRoles),
  validateCreateCompetence,
  competenceController.createCompetence,
);
router.get('/', protect, authorize(authorizedRoles), competenceController.getAllCompetences);
router.get('/:id', protect, authorize(authorizedRoles), competenceController.getCompetenceById);
router.put(
  '/:id',
  protect,
  authorize(authorizedRoles),
  validateUpdateCompetence,
  competenceController.updateCompetence,
);
router.delete('/:id', protect, authorize(authorizedRoles), competenceController.deleteCompetence);

module.exports = router;
