// Create this as: RecipewalaBE/scripts/cleanupStuckImages.js

const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');
require('dotenv').config();

async function cleanupStuckImages() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find recipes that are stuck (created more than 1 hour ago and still not generated)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const stuckRecipes = await Recipe.find({
            imageGenerated: false,
            imageGenerationFailed: { $ne: true },
            createdAt: { $lt: oneHourAgo }
        });

        console.log(`Found ${stuckRecipes.length} stuck recipes`);

        if (stuckRecipes.length > 0) {
            // Mark them as failed so they can be retried
            const result = await Recipe.updateMany(
                {
                    _id: { $in: stuckRecipes.map(r => r._id) }
                },
                {
                    $set: {
                        imageGenerationFailed: true,
                        imageGenerationAttempts: 1
                    }
                }
            );

            console.log(`Marked ${result.modifiedCount} recipes as failed`);

            // List the affected recipes
            stuckRecipes.forEach(recipe => {
                console.log(`- ${recipe.name} (${recipe._id}) - Created: ${recipe.createdAt}`);
            });
        }

        // Also find recipes that have been attempting for too long
        const veryOldAttempts = await Recipe.find({
            imageGenerated: false,
            imageGenerationAttempts: { $gt: 0 },
            lastImageGenerationAttempt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes ago
        });

        if (veryOldAttempts.length > 0) {
            console.log(`Found ${veryOldAttempts.length} recipes with old generation attempts`);
            
            const oldResult = await Recipe.updateMany(
                {
                    _id: { $in: veryOldAttempts.map(r => r._id) }
                },
                {
                    $set: {
                        imageGenerationFailed: true
                    }
                }
            );

            console.log(`Marked ${oldResult.modifiedCount} old attempts as failed`);
        }

        console.log('\nCleanup completed!');
        
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the cleanup
cleanupStuckImages();