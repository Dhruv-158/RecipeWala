const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiConfig {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.maxRetries = 3;
        this.timeout = 30000; // 30 seconds timeout
    }

    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    async generateRecipe(recipeName) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                logger.info(`Gemini API attempt ${attempt}/${this.maxRetries} for recipe: ${recipeName}`);
                
                const prompt = `Generate a detailed recipe for "${recipeName}". 
                Please provide the response in the following JSON format only, with no additional text:
                {
                    "name": "${recipeName}",
                    "description": "Brief description of the dish",
                    "prepTime": "preparation time",
                    "cookTime": "cooking time",
                    "servings": "number of servings",
                    "difficulty": "Easy/Medium/Hard",
                    "ingredients": [
                        {"item": "ingredient name", "amount": "quantity", "unit": "measurement unit"}
                    ],
                    "instructions": [
                        {"step": 1, "instruction": "detailed step description"}
                    ],
                    "tips": ["helpful cooking tip"],
                    "nutrition": {
                        "calories": "estimated calories per serving",
                        "protein": "protein content",
                        "carbs": "carbohydrate content",
                        "fat": "fat content"
                    }
                }
                
                Make sure the response is valid JSON and includes realistic cooking times, proper measurements, and detailed instructions. Do not include any text before or after the JSON.`;

                const result = await this.withTimeout(
                    this.model.generateContent(prompt),
                    this.timeout
                );
                
                const response = await result.response;
                const text = response.text().trim();

                // Clean up the response text
                let cleanText = text;
                
                // Remove markdown code blocks if present
                if (cleanText.startsWith('```json')) {
                    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanText.startsWith('```')) {
                    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                // Extract JSON from response
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error(`No valid JSON found in Gemini response. Response: ${text.substring(0, 200)}...`);
                }

                const recipeData = JSON.parse(jsonMatch[0]);
                
                // Validate required fields
                if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
                    throw new Error('Missing required fields in generated recipe');
                }

                logger.info(`Successfully generated recipe for: ${recipeName}`);
                return recipeData;

            } catch (error) {
                lastError = error;
                logger.warn(`Gemini API attempt ${attempt} failed for ${recipeName}:`, error.message);
                
                if (attempt === this.maxRetries) {
                    break;
                }
                
                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                logger.info(`Retrying Gemini API for ${recipeName} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        logger.error(`All Gemini API attempts failed for ${recipeName}:`, lastError);
        throw new Error(`Failed to generate recipe from Gemini API after ${this.maxRetries} attempts: ${lastError.message}`);
    }

    async isServiceAvailable() {
        try {
            logger.info('Checking Gemini service availability...');
            
            const result = await this.withTimeout(
                this.model.generateContent("Respond with just the word 'available'"),
                10000 // 10 seconds for service check
            );
            
            const response = await result.response;
            const text = response.text().trim().toLowerCase();
            const isAvailable = text.includes('available') || text.length > 0;
            
            logger.info(`Gemini service availability check: ${isAvailable ? 'Available' : 'Unavailable'}`);
            return isAvailable;
        } catch (error) {
            logger.error('Gemini service check failed:', error.message);
            return false;
        }
    }
}

module.exports = new GeminiConfig();
