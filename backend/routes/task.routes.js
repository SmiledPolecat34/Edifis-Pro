const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { protect, isManager, isAdmin } = require("../middlewares/auth.middleware");

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.post("/assign", taskController.assignUsersToTask);
router.get("/user/:userId", taskController.getTasksByUserId);


module.exports = router;
