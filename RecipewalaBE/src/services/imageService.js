// RecipewalaBE/src/services/imageService.js - Replace your existing imageService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ImageService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.maxRetries = 1000;
        this.timeout = 15000; // 15 seconds timeout per API call
    }

    /**
     * Create a timeout wrapper for promises
     */
    withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    /**
     * Generate an image prompt for a recipe using Gemini
     */
    async generateImagePrompt(recipeName, recipeDescription = '') {
        try {
            const prompt = `
                Create a detailed, appetizing image prompt for the recipe: "${recipeName}"
                ${recipeDescription ? `Description: ${recipeDescription}` : ''}
                
                Generate a photorealistic prompt that includes:
                - The finished dish beautifully plated
                - Proper lighting and styling
                - Appetizing presentation
                - Relevant garnishes or accompaniments
                
                Format the response as a single descriptive paragraph suitable for image generation APIs.
                Focus on visual details, colors, textures, and professional food photography style.
                Keep it under 200 words.
            `;

            const result = await this.withTimeout(
                this.model.generateContent(prompt),
                this.timeout
            );
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Error generating image prompt:', error);
            return `Professional food photography of ${recipeName}, beautifully plated on a white ceramic plate, garnished appropriately, soft natural lighting, appetizing presentation, high quality, detailed`;
        }
    }

    /**
     * Generate recipe image using Freepik API (free alternative)
     */
    async generateRecipeImageFreepik(recipeName) {
        if (!process.env.FREEPIK_API_KEY) {
            console.log('Freepik API key not configured');
            return null;
        }

        try {
            const searchQuery = recipeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
            const freepikUrl = `https://api.freepik.com/v1/resources?locale=en-US&page=1&limit=1&order=latest&term=${encodeURIComponent(searchQuery + ' food')}`;
            
            console.log(`Fetching image from Freepik for: ${recipeName}`);
            
            const response = await this.withTimeout(
                fetch(freepikUrl, {
                    headers: {
                        'X-Freepik-API-Key': process.env.FREEPIK_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }),
                this.timeout
            );

            if (!response.ok) {
                throw new Error(`Freepik API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                console.log(`Image found on Freepik for: ${recipeName}`);
                const resource = data.data[0];
                return {
                    imageUrl: resource.image?.source?.url || resource.thumbnails?.large?.url,
                    thumbnailUrl: resource.thumbnails?.medium?.url || resource.thumbnails?.small?.url,
                    attribution: {
                        author: resource.author?.username || 'Freepik',
                        authorUrl: resource.author?.url,
                        freepikUrl: resource.url,
                        source: 'freepik',
                        license: 'Freepik License'
                    }
                };
            }
            
            console.log(`No image found on Freepik for: ${recipeName}`);
            return null;
        } catch (error) {
            console.error(`Error fetching image from Freepik for ${recipeName}:`, error.message);
            return null;
        }
    }

    /**
     * Generate recipe image using OpenAI DALL-E (paid service)
     */
    async generateRecipeImageDALLE(recipeName, imagePrompt) {
        if (!process.env.OPENAI_API_KEY) {
            console.log('OpenAI API key not configured');
            return null;
        }

        try {
            console.log(`Generating DALL-E image for: ${recipeName}`);

            const response = await this.withTimeout(
                fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "dall-e-3",
                        prompt: imagePrompt,
                        n: 1,
                        size: "1024x1024",
                        quality: "standard"
                    })
                }),
                30000 // 30 seconds for DALL-E
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`DALL-E API error: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                console.log(`DALL-E image generated for: ${recipeName}`);
                return {
                    imageUrl: data.data[0].url,
                    thumbnailUrl: data.data[0].url,
                    generated: true,
                    attribution: {
                        source: 'dalle'
                    }
                };
            }
            
            return null;
        } catch (error) {
            console.error(`Error generating DALL-E image for ${recipeName}:`, error.message);
            return null;
        }
    }

    /**
     * Main method to generate recipe image with fallback options and retries
     */
    async generateRecipeImage(recipeName, recipeDescription = '') {
        console.log(`Starting image generation for: ${recipeName}`);
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Image generation attempt ${attempt}/${this.maxRetries} for: ${recipeName}`);

                // Step 1: Generate image prompt using Gemini (with timeout)
                let imagePrompt;
                try {
                    imagePrompt = await this.withTimeout(
                        this.generateImagePrompt(recipeName, recipeDescription),
                        10000 // 10 seconds for prompt generation
                    );
                    console.log(`Generated image prompt for ${recipeName}:`, imagePrompt.substring(0, 100) + '...');
                } catch (promptError) {
                    console.warn(`Failed to generate prompt for ${recipeName}, using fallback:`, promptError.message);
                    imagePrompt = `Professional food photography of ${recipeName}, beautifully plated, appetizing presentation`;
                }

                // Step 2: Try different image generation services in order of preference
                let imageResult = null;

                // Option 1: Try DALL-E (best quality, paid)
                if (process.env.OPENAI_API_KEY && !imageResult) {
                    try {
                        imageResult = await this.generateRecipeImageDALLE(recipeName, imagePrompt);
                        if (imageResult) {
                            console.log(`✅ Image generated using DALL-E for: ${recipeName}`);
                            return imageResult;
                        }
                    } catch (dalleError) {
                        console.warn(`DALL-E failed for ${recipeName}:`, dalleError.message);
                    }
                }

                // Option 2: Try Freepik (free, real photos)
                if (process.env.FREEPIK_API_KEY && !imageResult) {
                    try {
                        imageResult = await this.generateRecipeImageFreepik(recipeName);
                        if (imageResult) {
                            console.log(`✅ Image found using Freepik for: ${recipeName}`);
                            return imageResult;
                        }
                    } catch (freepikError) {
                        console.warn(`Freepik failed for ${recipeName}:`, freepikError.message);
                    }
                }

                // If we reach here, all methods failed for this attempt
                if (attempt === this.maxRetries) {
                    console.error(`❌ All image generation methods failed for: ${recipeName} after ${this.maxRetries} attempts`);
                    return null;
                }

                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Retrying image generation for ${recipeName} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));

            } catch (error) {
                console.error(`Unexpected error in image generation attempt ${attempt} for ${recipeName}:`, error);
                
                if (attempt === this.maxRetries) {
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * Check if image generation services are available
     */
    async checkServiceAvailability() {
        const services = {
            openai: !!process.env.OPENAI_API_KEY,
            freepik: !!process.env.FREEPIK_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY
        };

        console.log('Image service availability:', services);
        return services;
    }
}

module.exports = new ImageService();