const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// @route   GET /api/status
// @desc    Get the current maintenance status of the site
// @access  Public
router.get('/', statusController.getStatus);

// @route   POST /api/status/toggle
// @desc    Toggle maintenance mode on or off
// @access  Private (Admin only)
router.post('/toggle', protect, isAdmin, statusController.toggleStatus);

module.exports = router;
