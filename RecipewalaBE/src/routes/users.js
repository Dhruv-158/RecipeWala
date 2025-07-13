const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all user routes
router.use(auth);

// User profile routes
const upload = require('../middleware/upload');
router.get('/profile', userController.getProfile);
router.put('/profile', 
    upload.single('image'),
    [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Username must be between 3 and 20 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        handleValidationErrors
    ], 
    userController.updateProfile
);

router.get('/dashboard-stats', userController.getDashboardStats);

router.put('/change-password', [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
], userController.changePassword);

router.delete('/account', [
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
], userController.deleteAccount);

module.exports = router;
