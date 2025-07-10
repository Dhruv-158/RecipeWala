const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes require authentication
router.use(auth);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
