const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheet.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");


router.post("/clockin", protect, timesheetController.clockIn);
router.post("/clockout", protect, timesheetController.clockOut);
router.post("/", timesheetController.createTimesheet);
router.get("/", timesheetController.getAllTimesheets);
router.get("/:id", timesheetController.getTimesheetById);
router.put("/:id", timesheetController.updateTimesheet);
router.delete("/:id", timesheetController.deleteTimesheet);



module.exports = router;
