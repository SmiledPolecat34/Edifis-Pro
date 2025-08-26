const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, isAdmin, canManagerControl } = require("../middlewares/auth.middleware");
const { upload, setUploadType } = require("../middlewares/upload.middleware");
const { validate, schemas } = require("../middlewares/validator.middleware");
const { rateLimitIP } = require("../middlewares/rateLimit.middleware");

// Suggérer un email unique (protégé pour être utilisé depuis l'admin)
router.get("/suggest-email", protect, userController.suggestEmail);

router.post("/register", protect, isAdmin, validate(schemas.register), userController.createUser);
router.post("/login", rateLimitIP(), validate(schemas.login), userController.login);

// Routes protégées

router.post("/upload-profile", protect, setUploadType("profile"), upload.single("image"), userController.updateProfilePicture);

router.get("/all/manager", protect, userController.getAllManagers);
router.get("/all", protect, isAdmin, userController.getAllUsers);
router.get('/getallworkers', protect, isAdmin, userController.getAllWorkers);
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, canManagerControl, userController.updateUser);
router.delete("/:id", protect, canManagerControl, userController.deleteUser);

// Changer le mot de passe
router.post("/change-password", protect, validate(schemas.changePassword), userController.changePassword);

module.exports = router;