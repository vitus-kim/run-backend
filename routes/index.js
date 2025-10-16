const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const runningRoutes = require('./runningRoutes');
const scoreRoutes = require('./scoreRoutes');
const enhancedRunningRoutes = require('./enhancedRunningRoutes');
const performanceAnalyticsRoutes = require('./performanceAnalyticsRoutes');
const growthDashboardRoutes = require('./growthDashboardRoutes');
const migrationRoutes = require('./migrationRoutes');

// Use routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/running', runningRoutes);
router.use('/scores', scoreRoutes);
router.use('/enhanced-running', enhancedRunningRoutes);
router.use('/analytics', performanceAnalyticsRoutes);
router.use('/dashboard', growthDashboardRoutes);
router.use('/migration', migrationRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

