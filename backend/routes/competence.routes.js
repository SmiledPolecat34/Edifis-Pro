const express = require("express");
const router = express.Router();
const competenceController = require("../controllers/competence.controller");
const { validate, schemas } = require("../middlewares/validator.middleware");

// Validation middleware
const validateCreateCompetence = validate(schemas.createCompetence);
const validateUpdateCompetence = validate(schemas.updateCompetence);

// Routes avec validation
router.post("/", validateCreateCompetence, competenceController.createCompetence);
router.get("/", competenceController.getAllCompetences);
router.get("/:id", competenceController.getCompetenceById);
router.put("/:id", validateUpdateCompetence, competenceController.updateCompetence);
router.delete("/:id", competenceController.deleteCompetence);

module.exports = router;
