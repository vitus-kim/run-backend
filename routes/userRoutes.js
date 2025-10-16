const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// GET /api/users - Get all users
router.get('/', userController.getUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id', userController.deleteUser);

module.exports = router;

