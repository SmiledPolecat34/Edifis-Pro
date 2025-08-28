const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, isAdmin, isHR, canManageUsers } = require("../middlewares/auth.middleware");

// Création : Admin & HR
router.post("/", protect, (req, res, next) => {
    if (req.user.role === "Admin" || req.user.role === "HR") return next();
    return res.status(403).json({ message: "Accès interdit" });
}, userController.createUser);

// ✅ Place les routes spécifiques AVANT /:id
router.get("/list", protect, userController.getDirectory);
router.get("/getallworkers", protect, isAdmin, userController.getAllWorkers);
router.get("/all", protect, isAdmin, userController.getAllUsers);

// ⚠️ L'attrape-tout en dernier
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, canManageUsers, userController.updateUser);
router.delete("/:id", protect, canManageUsers, userController.deleteUser);

module.exports = router;
