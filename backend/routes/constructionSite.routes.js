const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/constructionSite.controller");
const { protect } = require("../middlewares/auth.middleware");
const { upload, setUploadType } = require("../middlewares/upload.middleware");

// Création: Admin/Manager
router.post("/", protect, setUploadType('construction'), upload.single('image'), (req, res, next) => {
    if (req.user && ["Admin", "Manager"].includes(req.user.role)) return next();
    return res.status(403).json({ message: "Seul Admin/Manager peut créer" });
}, ctrl.createConstructionSite);

// Lecture
router.get("/", protect, ctrl.getAllConstructionSites);
router.get("/:id/users", protect, ctrl.getUsersOfConstructionSite);
router.get("/:id", protect, ctrl.getConstructionSiteById);

// Modification: Admin/Manager
router.put("/:id", protect, (req, res, next) => {
    if (req.user && ["Admin", "Manager"].includes(req.user.role)) return next();
    return res.status(403).json({ message: "Seul Admin/Manager peut modifier" });
}, ctrl.updateConstructionSite);

// Suppression: Admin uniquement
router.delete("/:id", protect, (req, res, next) => {
    if (req.user && req.user.role === "Admin") return next();
    return res.status(403).json({ message: "Seul Admin peut supprimer" });
}, ctrl.deleteConstructionSite);

module.exports = router;
