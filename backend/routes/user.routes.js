const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, authorize, canManageUsers, ROLES } = require("../middlewares/auth.middleware");

// Visibility: Admin, HR, Manager
router.get("/all", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.getAllUsers);
router.get("/all/manager", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.getAllManagers);
router.get("/list", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.getDirectory);
router.get("/getallworkers", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.getAllWorkers);
router.get("/:id", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.getUserById);

// Creation: Admin, HR, Manager
router.post("/", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), userController.createUser);

// Modification: Admin, HR, Manager
router.put("/:id", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), canManageUsers, userController.updateUser);

// Deletion: Admin, HR
router.delete("/:id", protect, authorize([ROLES.Admin, ROLES.HR]), canManageUsers, userController.deleteUser);

router.post("/assign-competence", protect, authorize([ROLES.Admin, ROLES.Manager]), userController.assignCompetenceToUser);

module.exports = router;
