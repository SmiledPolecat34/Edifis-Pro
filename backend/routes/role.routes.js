// backend/routes/role.routes.js
const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");
const { protect, authorize, ROLES } = require("../middlewares/auth.middleware");

// Log simple pour diagnostiquer si une des fonctions est undefined
console.log("[roles routes] handlers:", {
    createRole: typeof roleController.createRole,
    getRoles: typeof roleController.getRoles,
    updateRole: typeof roleController.updateRole,
    deleteRole: typeof roleController.deleteRole,
});

// CRUD rôles (réservé Admin)
router.post("/", protect, roleController.createRole);
router.get("/", protect, roleController.getRoles);
router.put("/:id", protect, roleController.updateRole);
router.delete("/:id", protect, roleController.deleteRole);

module.exports = router;
