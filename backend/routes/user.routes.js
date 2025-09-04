const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, isAdmin, canManageUsers } = require("../middlewares/auth.middleware");

// Création (tu veux: Admin, HR, Manager)
router.post(
    "/",
    protect,
    (req, res, next) => {
        if (["Admin", "HR", "Manager"].includes(req.user.role)) return next();
        return res.status(403).json({ message: "Accès interdit" });
    },
    userController.createUser
);

router.get("/project-chiefs", protect, userController.getAllProjectChiefs);

// Liste “directory” selon le rôle (Admin/HR/Manager/Project_Chief/Worker)
router.get("/list", protect, userController.getDirectory);

// Workers “brut”
router.get("/getallworkers", protect, isAdmin, userController.getAllWorkers);

// Tous les users (admin only)
router.get("/all", protect, isAdmin, userController.getAllUsers);

// Suggestion d’email (auth requis suffit)
router.get("/suggest-email", protect, userController.suggestEmail);

router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, canManageUsers, userController.updateUser);
router.delete("/:id", protect, canManageUsers, userController.deleteUser);

module.exports = router;
