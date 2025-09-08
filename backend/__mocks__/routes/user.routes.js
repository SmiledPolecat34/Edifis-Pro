const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller"); // This will be the mocked userController
const { protect, isAdmin, canManageUsers } = require("../../middlewares/auth.middleware");
const { upload, setUploadType } = require("../../middlewares/upload.middleware");

// Re-implement the routes using the (potentially mocked) userController
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

router.get("/assignable-to-task", protect, userController.getAssignableUsers);

router.get("/list", protect, userController.getDirectory);

router.get("/getallworkers", protect, isAdmin, userController.getAllWorkers);

router.get("/all", protect, isAdmin, userController.getAllUsers);

router.get("/suggest-email", protect, userController.suggestEmail);

router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, canManageUsers, userController.updateUser);
router.delete("/:id", protect, canManageUsers, userController.deleteUser);

router.post(
    "/upload-profile",
    protect,
    setUploadType('profile'),
    upload.single('profilePicture'),
    userController.updateProfilePicture
);

module.exports = router;