const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiConfig {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generateRecipe(recipeName) {
        try {
            const prompt = `Generate a detailed recipe for "${recipeName}". 
            Please provide the response in the following JSON format:
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
            
            Make sure the response is valid JSON and includes realistic cooking times, proper measurements, and detailed instructions.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response (Gemini sometimes adds extra text)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in Gemini response');
            }

            const recipeData = JSON.parse(jsonMatch[0]);
            return recipeData;

        } catch (error) {
            logger.error('Gemini API error:', error);
            throw new Error('Failed to generate recipe from Gemini API');
        }
    }

    async isServiceAvailable() {
        try {
            const result = await this.model.generateContent("Say 'Hello'");
            const response = await result.response;
            return response.text().length > 0;
        } catch (error) {
            logger.error('Gemini service check failed:', error);
            return false;
        }
    }
}

module.exports = new GeminiConfig();
