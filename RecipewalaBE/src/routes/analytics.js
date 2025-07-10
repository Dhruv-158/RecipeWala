// src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/insights (protected, per-user)
const auth = require('../middleware/auth');
router.get('/insights', auth, analyticsController.getInsights);

module.exports = router;
