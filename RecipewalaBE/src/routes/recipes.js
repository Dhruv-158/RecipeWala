const express = require('express');
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const { recipeValidation } = require('../middleware/validation');
const { recipeLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Apply authentication to all recipe routes
router.use(auth);

// Recipe routes
router.post('/generate', recipeLimiter, recipeValidation, recipeController.generateRecipe);
router.get('/', recipeController.getUserRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipeController.getRecipeById);
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
