const Recipe = require('../models/Recipe');
const geminiConfig = require('../config/gemini');
const imageService = require('../services/imageService');
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

        // Create recipe in database WITHOUT waiting for image generation
        const recipe = new Recipe({
            ...recipeData,
            user: userId,
            originalPrompt: recipeName.trim(),
            isFavorite: false,
            imageUrl: null,
            imageGenerated: false,
            imageGenerationFailed: false, // Track failed attempts
            imageGenerationAttempts: 0    // Track number of attempts
        });

        await recipe.save();
        logger.info(`Recipe generated and saved: ${recipe._id}`);

        // Prepare response data immediately
        const responseRecipe = {
            _id: recipe._id,
            id: recipe._id.toString(),
            name: recipe.name,
            title: recipe.name,
            description: recipe.description,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            tips: recipe.tips,
            nutrition: recipe.nutrition,
            originalPrompt: recipe.originalPrompt,
            isFavorite: recipe.isFavorite || false,
            tags: recipe.tags || [],
            cuisine: recipe.cuisine,
            imageUrl: recipe.imageUrl,
            thumbnailUrl: recipe.thumbnailUrl,
            imageGenerated: recipe.imageGenerated || false,
            imageGenerationFailed: recipe.imageGenerationFailed || false,
            imageAttribution: recipe.imageAttribution,
            imagePrompt: recipe.imagePrompt,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt
        };

        // Send response immediately
        responseHandler.success(res, {
            recipe: responseRecipe
        }, 'Recipe generated successfully', 201);

        // Generate image in the background with timeout and failure tracking
        setImmediate(async () => {
            try {
                logger.info(`Starting background image generation for recipe: ${recipe._id}`);
                
                // Update attempt counter
                await Recipe.findByIdAndUpdate(recipe._id, {
                    $inc: { imageGenerationAttempts: 1 }
                });

                // Set a maximum timeout for the entire image generation process
                const imageGenerationPromise = imageService.generateRecipeImage(
                    recipeName, 
                    recipeData.description
                );

                // Race between image generation and timeout
                const imageResult = await Promise.race([
                    imageGenerationPromise,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Image generation timeout after 60 seconds')), 60000)
                    )
                ]);

                if (imageResult) {
                    await Recipe.findByIdAndUpdate(recipe._id, {
                        imageUrl: imageResult.imageUrl,
                        thumbnailUrl: imageResult.thumbnailUrl,
                        imageGenerated: true,
                        imageGenerationFailed: false,
                        imageAttribution: imageResult.attribution
                    });
                    
                    logger.info(`✅ Background image generated successfully for recipe: ${recipe._id}`);
                } else {
                    // Mark as failed if no image could be generated
                    await Recipe.findByIdAndUpdate(recipe._id, {
                        imageGenerated: false,
                        imageGenerationFailed: true
                    });
                    
                    logger.warn(`⚠️ Background image generation failed (no result) for recipe: ${recipe._id}`);
                }
            } catch (imageError) {
                // Mark as failed and log the error
                await Recipe.findByIdAndUpdate(recipe._id, {
                    imageGenerated: false,
                    imageGenerationFailed: true
                });
                
                logger.error(`❌ Background image generation error for recipe ${recipe._id}:`, {
                    error: imageError.message,
                    stack: imageError.stack
                });
            }
        });

    } catch (error) {
        logger.error('Recipe generation error:', error);
        
        if (error.message.includes('Gemini')) {
            return responseHandler.error(res, 'Failed to generate recipe. Please try again.', 502);
        }
        
        responseHandler.error(res, 'Failed to generate recipe', 500);
    }
};

// Add a new method to retry failed image generations
const retryImageGeneration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, user: userId });

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        if (recipe.imageGenerated && recipe.imageUrl) {
            return responseHandler.success(res, {
                imageUrl: recipe.imageUrl,
                thumbnailUrl: recipe.thumbnailUrl,
                message: 'Image already exists'
            }, 'Image already generated');
        }

        // Reset failure status and retry
        await Recipe.findByIdAndUpdate(recipe._id, {
            imageGenerationFailed: false,
            $inc: { imageGenerationAttempts: 1 }
        });

        logger.info(`Retrying image generation for recipe: ${recipe.name} (${recipe._id})`);

        const imageResult = await imageService.generateRecipeImage(
            recipe.name, 
            recipe.description
        );

        if (imageResult) {
            await Recipe.findByIdAndUpdate(recipe._id, {
                imageUrl: imageResult.imageUrl,
                thumbnailUrl: imageResult.thumbnailUrl,
                imageGenerated: true,
                imageGenerationFailed: false,
                imageAttribution: imageResult.attribution
            });

            responseHandler.success(res, {
                imageUrl: imageResult.imageUrl,
                thumbnailUrl: imageResult.thumbnailUrl,
                attribution: imageResult.attribution,
                retried: true
            }, 'Image generated successfully');
        } else {
            await Recipe.findByIdAndUpdate(recipe._id, {
                imageGenerationFailed: true
            });

            responseHandler.error(res, 'Failed to generate image after retry', 500);
        }

    } catch (error) {
        logger.error('Retry image generation error:', error);
        
        // Mark as failed
        await Recipe.findByIdAndUpdate(req.params.id, {
            imageGenerationFailed: true
        });
        
        responseHandler.error(res, 'Failed to retry image generation', 500);
    }
};

const generateRecipeImage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, user: userId });

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        if (recipe.imageUrl && recipe.imageGenerated) {
            return responseHandler.success(res, {
                imageUrl: recipe.imageUrl,
                thumbnailUrl: recipe.thumbnailUrl,
                cached: true
            }, 'Image already exists');
        }

        logger.info(`Generating image for recipe: ${recipe.name}`);

        const imageResult = await imageService.generateRecipeImage(
            recipe.name, 
            recipe.description
        );

        if (imageResult) {
            recipe.imageUrl = imageResult.imageUrl;
            recipe.thumbnailUrl = imageResult.thumbnailUrl;
            recipe.imageGenerated = true;
            recipe.imageAttribution = imageResult.attribution;
            await recipe.save();

            responseHandler.success(res, {
                imageUrl: recipe.imageUrl,
                thumbnailUrl: recipe.thumbnailUrl,
                attribution: recipe.imageAttribution,
                generated: true
            }, 'Image generated successfully');
        } else {
            responseHandler.error(res, 'Failed to generate image', 500);
        }

    } catch (error) {
        logger.error('Generate recipe image error:', error);
        responseHandler.error(res, 'Failed to generate recipe image', 500);
    }
};

const getUserRecipes = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { user: userId };
        if (req.query.favorites === 'true') {
            filter.isFavorite = true;
        }

        const recipes = await Recipe.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('name description difficulty prepTime cookTime servings createdAt isFavorite tags cuisine imageUrl thumbnailUrl imageGenerated');

        const total = await Recipe.countDocuments(filter);

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

const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, user: userId });

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        recipe.isFavorite = !recipe.isFavorite;
        await recipe.save();

        logger.info(`Recipe favorite toggled: ${recipe._id} to ${recipe.isFavorite} by user: ${req.user.email}`);

        responseHandler.success(res, {
            recipe: {
                _id: recipe._id,
                id: recipe._id,
                isFavorite: recipe.isFavorite
            }
        }, `Recipe ${recipe.isFavorite ? 'added to' : 'removed from'} favorites`);

    } catch (error) {
        logger.error('Toggle favorite error:', error);
        responseHandler.error(res, 'Failed to update favorite status', 500);
    }
};

const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        delete updateData.user;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const recipe = await Recipe.findOneAndUpdate(
            { _id: id, user: userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!recipe) {
            return responseHandler.error(res, 'Recipe not found', 404);
        }

        logger.info(`Recipe updated: ${recipe._id} by user: ${req.user.email}`);

        responseHandler.success(res, {
            recipe
        }, 'Recipe updated successfully');

    } catch (error) {
        logger.error('Update recipe error:', error);
        responseHandler.error(res, 'Failed to update recipe', 500);
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
        .select('name description difficulty prepTime cookTime servings createdAt isFavorite tags cuisine imageUrl thumbnailUrl')
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
    toggleFavorite,
    updateRecipe,
    searchRecipes,
    generateRecipeImage,
    retryImageGeneration
};