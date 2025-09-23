const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const statusRoutes = require('./status.routes');
const competenceRoutes = require('./competence.routes');
const constructionSiteRoutes = require('./constructionSite.routes');
const taskRoutes = require('./task.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/status', statusRoutes);
router.use('/competences', competenceRoutes);
router.use('/construction-sites', constructionSiteRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
