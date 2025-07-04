const geminiConfig = require('../config/gemini');
const logger = require('../utils/logger');

class GeminiService {
    constructor() {
        this.requestCount = 0;
        this.lastResetTime = Date.now();
        this.maxRequestsPerMinute = 60; // Adjust based on your Gemini API limits
    }

    async generateRecipe(recipeName) {
        try {
            // Check rate limiting
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded for Gemini API');
            }

            this.requestCount++;
            logger.info(`Gemini API request count: ${this.requestCount}`);

            const recipeData = await geminiConfig.generateRecipe(recipeName);
            
            // Validate the generated recipe data
            this.validateRecipeData(recipeData);
            
            return recipeData;
        } catch (error) {
            logger.error('Gemini service error:', error);
            throw error;
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const timeElapsed = now - this.lastResetTime;
        
        // Reset counter every minute
        if (timeElapsed >= 60000) {
            this.requestCount = 0;
            this.lastResetTime = now;
            return true;
        }
        
        return this.requestCount < this.maxRequestsPerMinute;
    }

    validateRecipeData(recipeData) {
        const requiredFields = ['name', 'ingredients', 'instructions'];
        
        for (const field of requiredFields) {
            if (!recipeData[field]) {
                throw new Error(`Missing required field: ${field} in recipe data`);
            }
        }

        if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
            throw new Error('Recipe must have at least one ingredient');
        }

        if (!Array.isArray(recipeData.instructions) || recipeData.instructions.length === 0) {
            throw new Error('Recipe must have at least one instruction');
        }
    }

    async isServiceHealthy() {
        try {
            return await geminiConfig.isServiceAvailable();
        } catch (error) {
            logger.error('Gemini health check failed:', error);
            return false;
        }
    }
}

module.exports = new GeminiService();
