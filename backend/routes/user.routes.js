// routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, isAdmin, canManageUsers } = require("../middlewares/auth.middleware");

// Création : Admin, HR, Manager
router.post(
    "/",
    protect,
    (req, res, next) => {
        if (["Admin", "HR", "Manager"].includes(req.user.role)) return next();
        return res.status(403).json({ message: "Accès interdit" });
    },
    userController.createUser
);

router.get("/list", protect, userController.getDirectory);

// Liste workers (laisse comme tu veux : admin only ou expose un /list filtré)
router.get("/getallworkers", protect, isAdmin, userController.getAllWorkers);
router.get("/all", protect, isAdmin, userController.getAllUsers);

router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, canManageUsers, userController.updateUser);
router.delete("/:id", protect, canManageUsers, userController.deleteUser);

module.exports = router;
