const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public read access for roles (utilisé sur Register page)
router.get("/", roleController.getRoles);

// Write operations require authentication
router.post("/", protect, roleController.createRole);
router.put("/:id", protect, roleController.updateRole);
router.delete("/:id", protect, roleController.deleteRole);

module.exports = router;
