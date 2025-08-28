const express = require("express");
const router = express.Router();
const constructionController = require("../controllers/constructionSite.controller");
const { protect, authorize, ROLES } = require("../middlewares/auth.middleware");
const { upload, setUploadType } = require("../middlewares/upload.middleware");

// Visibility for all except worker
router.get("/", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), constructionController.getAllConstructionSites);
router.get("/:id", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), constructionController.getConstructionSiteById);
router.get("/user/:userId", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), constructionController.getConstructionSitesByUserId);

// Creation for Admin, HR, Manager
router.post("/", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), setUploadType('construction'), upload.single('image'), constructionController.createConstructionSite);

// Modification for Admin, HR, Manager
router.put("/:id", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), constructionController.updateConstructionSite);

// Deletion for Admin, HR
router.delete("/:id", protect, authorize([ROLES.Admin, ROLES.HR]), constructionController.deleteConstructionSite);

// Assign project manager
router.post("/assign", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), constructionController.assignConstructionSite);

// Upload construction site image
router.post("/upload", protect, authorize([ROLES.Admin, ROLES.HR, ROLES.Manager]), setUploadType('construction'), upload.single('image'), constructionController.updateConstructionImage);

module.exports = router;
