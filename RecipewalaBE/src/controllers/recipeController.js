const Recipe = require('../models/Recipe');
const geminiConfig = require('../config/gemini');
const logger = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');

const generateRecipe = async (req, res) => {
    try {
        const { recipeName } = req.body;
        const userId = req.user._id;

        // Check if recipe with same name already exists for this user
        const existingRecipe = await Recipe.findOne({ 
            name: recipeName.trim(), 
            user: userId 
        });

        if (existingRecipe) {
            return responseHandler.error(res, 'Recipe with this name already exists', 400);
        }

        // Check Gemini service availability
        const isGeminiAvailable = await geminiConfig.isServiceAvailable();
        if (!isGeminiAvailable) {
            return responseHandler.error(res, 'Recipe generation service is currently unavailable', 503);
        }


        // Generate recipe using Gemini
        logger.info(`Generating recipe for: ${recipeName} by user: ${req.user.email}`);
        const recipeData = await geminiConfig.generateRecipe(recipeName);

        // Ensure every ingredient has a unit
        if (Array.isArray(recipeData.ingredients)) {
            recipeData.ingredients = recipeData.ingredients.map(ing => ({
                ...ing,
                unit: ing.unit || 'to taste'
            }));
        }

        // Create recipe in database
        const recipe = new Recipe({
            ...recipeData,
            user: userId,
            originalPrompt: recipeName.trim()
        });

        await recipe.save();

        logger.info(`Recipe generated and saved: ${recipe._id}`);

        responseHandler.success(res, {
            recipe
        }, 'Recipe generated successfully', 201);

    } catch (error) {
        logger.error('Recipe generation error:', error);
        
        if (error.message.includes('Gemini')) {
            return responseHandler.error(res, 'Failed to generate recipe. Please try again.', 502);
        }
        
        responseHandler.error(res, 'Failed to generate recipe', 500);
    }
};

const getUserRecipes = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const recipes = await Recipe.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('name description difficulty prepTime cookTime servings createdAt');

        const total = await Recipe.countDocuments({ user: userId });

        responseHandler.success(res, {
            recipes,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        }, 'Recipes retrieved successfully');

    } catch (error) {
        logger.error('Get user recipes error:', error);
        responseHandler.error(res, 'Failed to retrieve recipes', 500);
    }
};

const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, user: userId });

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        responseHandler.success(res, {
            recipe
        }, 'Recipe retrieved successfully');

    } catch (error) {
        logger.error('Get recipe by ID error:', error);
        responseHandler.error(res, 'Failed to retrieve recipe', 500);
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOneAndDelete({ _id: id, user: userId });

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        logger.info(`Recipe deleted: ${recipe._id} by user: ${req.user.email}`);

        responseHandler.success(res, null, 'Recipe deleted successfully');

    } catch (error) {
        logger.error('Delete recipe error:', error);
        responseHandler.error(res, 'Failed to delete recipe', 500);
    }
};

const searchRecipes = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || query.trim().length < 2) {
            return responseHandler.error(res, 'Search query must be at least 2 characters', 400);
        }

        const recipes = await Recipe.find({
            user: userId,
            $text: { $search: query }
        })
        .select('name description difficulty prepTime cookTime servings createdAt')
        .sort({ score: { $meta: 'textScore' } })
        .limit(20);

        responseHandler.success(res, {
            recipes,
            query: query.trim()
        }, 'Search completed successfully');

    } catch (error) {
        logger.error('Search recipes error:', error);
        responseHandler.error(res, 'Search failed', 500);
    }
};

module.exports = {
    generateRecipe,
    getUserRecipes,
    getRecipeById,
    deleteRecipe,
    searchRecipes
};
