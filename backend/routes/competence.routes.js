const express = require("express");
const router = express.Router();
const competenceController = require("../controllers/competence.controller");

router.post("/", competenceController.createCompetence);
router.get("/", competenceController.getAllCompetences);
router.get("/:id", competenceController.getCompetenceById);
router.put("/:id", competenceController.updateCompetence);
router.delete("/:id", competenceController.deleteCompetence);

module.exports = router;
