const express = require("express");
const router = express.Router();
const constructionController = require("../controllers/constructionSite.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// ⚡ Création : Admin ou Manager
router.post(
    "/",
    protect,
    (req, res, next) => {
        console.log("[ROUTE] POST /api/construction-site");
        console.log("User role:", req.user?.role);
        if (req.user.role === "Admin" || req.user.role === "Manager") return next();
        return res.status(403).json({ message: "Seul Admin/Manager peut créer un chantier" });
    },
    (req, res) => {
        console.log("[ROUTE] Delegating to createConstructionSite");
        constructionController.createConstructionSite(req, res);
    }
);

// ⚡ Lecture
router.get("/", protect, (req, res) => {
    console.log("[ROUTE] GET /api/construction-site");
    constructionController.getAllConstructionSites(req, res);
});

router.get("/:id", protect, (req, res) => {
    console.log("[ROUTE] GET /api/construction-site/:id", req.params.id);
    constructionController.getConstructionSiteById(req, res);
});

// ⚡ Modification : Admin ou Manager
router.put(
    "/:id",
    protect,
    (req, res, next) => {
        console.log("[ROUTE] PUT /api/construction-site/:id", req.params.id);
        console.log("User role:", req.user?.role);
        if (req.user.role === "Admin" || req.user.role === "Manager") return next();
        return res.status(403).json({ message: "Seul Admin/Manager peut modifier un chantier" });
    },
    (req, res) => {
        console.log("[ROUTE] Delegating to updateConstructionSite");
        constructionController.updateConstructionSite(req, res);
    }
);

// ⚡ Suppression : uniquement Admin
router.delete("/:id", protect, isAdmin, (req, res) => {
    console.log("[ROUTE] DELETE /api/construction-site/:id", req.params.id);
    constructionController.deleteConstructionSite(req, res);
});

// ⚡ Assignation d’un chef de chantier
router.post("/assign", protect, isAdmin, (req, res) => {
    console.log("[ROUTE] POST /api/construction-site/assign", req.body);
    constructionController.assignConstructionSite(req, res);
});

// ⚡ Upload image chantier
router.post("/upload", protect, isAdmin, (req, res) => {
    console.log("[ROUTE] POST /api/construction-site/upload");
    constructionController.updateConstructionImage(req, res);
});

// ⚡ Chantiers par utilisateur
router.get("/user/:userId", protect, (req, res) => {
    console.log("[ROUTE] GET /api/construction-site/user/:userId", req.params.userId);
    constructionController.getConstructionSitesByUserId(req, res);
});

module.exports = router;
