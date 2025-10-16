const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register - User registration
router.post('/register', authController.register);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logout);

// GET /api/auth/profile - Get user profile (인증 필요)
router.get('/profile', authenticateToken, authController.getProfile);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

module.exports = router;

