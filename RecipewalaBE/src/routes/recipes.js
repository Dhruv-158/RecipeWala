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

// Only match a valid MongoDB ObjectId for :id
router.get('/:id([0-9a-fA-F]{24})', recipeController.getRecipeById);
router.put('/:id([0-9a-fA-F]{24})', recipeController.updateRecipe);
router.delete('/:id([0-9a-fA-F]{24})', recipeController.deleteRecipe);

// Toggle favorite route
router.patch('/:id([0-9a-fA-F]{24})/favorite', recipeController.toggleFavorite);

// Image generation route
router.post('/:id([0-9a-fA-F]{24})/generate-image', recipeController.generateRecipeImage);

// Add to your routes/recipes.js
router.post('/:id([0-9a-fA-F]{24})/retry-image', recipeController.retryImageGeneration);

module.exports = router;