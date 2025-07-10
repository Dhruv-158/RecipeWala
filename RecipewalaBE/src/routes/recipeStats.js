const express = require('express');
const router = express.Router();
const recipeStatsController = require('../controllers/recipeStatsController');
const auth = require('../middleware/auth');

// All stats routes require authentication
router.use(auth);

// GET /api/recipes/stats
router.get('/', recipeStatsController.getUserRecipeStats);

module.exports = router;
