const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { protect, isAdmin, isManager, authorize } = require("../middlewares/auth.middleware");

router.post("/", protect, isAdmin, taskController.createTask); // Admin
router.put("/:id", protect, isAdmin, taskController.updateTask);
router.delete("/:id", protect, isAdmin, taskController.deleteTask);

router.get("/", protect, taskController.getAllTasks);
router.get("/:id", protect, taskController.getTaskById);

// Manager peut assigner
router.post("/assign", protect, authorize(['Manager', 'Admin']), taskController.assignUsersToTask);

router.get("/user/:userId", protect, taskController.getTasksByUserId);

module.exports = router;
