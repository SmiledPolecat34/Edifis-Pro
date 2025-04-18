const express = require("express");
const router = express.Router();
const constructionSiteController = require("../controllers/constructionSite.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");
const { upload, setUploadType } = require("../middlewares/upload.middleware");

router.post("/", setUploadType("construction"), upload.single("image"), constructionSiteController.createConstructionSite);
router.get("/", protect, constructionSiteController.getAllConstructionSites);
router.get("/:id", constructionSiteController.getConstructionSiteById);
router.put("/:id", constructionSiteController.updateConstructionSite);
router.delete("/:id", constructionSiteController.deleteConstructionSite);
router.get("/user/:userId", protect, constructionSiteController.getConstructionSitesByUserId);


router.post("/assign", protect, isAdmin, constructionSiteController.assignConstructionSite);

module.exports = router;
