// Update your Recipe.js model to include these new fields

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        trim: true
    }
});

const instructionSchema = new mongoose.Schema({
    step: {
        type: Number,
        required: true
    },
    instruction: {
        type: String,
        required: true,
        trim: true
    }
});

const nutritionSchema = new mongoose.Schema({
    calories: String,
    protein: String,
    carbs: String,
    fat: String
});

const imageAttributionSchema = new mongoose.Schema({
    photographer: String,
    photographerUrl: String,
    unsplashUrl: String,
    source: {
        type: String,
        enum: ['unsplash', 'dalle', 'stability', 'generated'],
        default: 'generated'
    }
});

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Recipe name is required'],
        trim: true,
        maxlength: [100, 'Recipe name must be less than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters']
    },
    prepTime: {
        type: String,
        trim: true
    },
    cookTime: {
        type: String,
        trim: true
    },
    servings: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    ingredients: [ingredientSchema],
    instructions: [instructionSchema],
    tips: [{
        type: String,
        trim: true
    }],
    nutrition: nutritionSchema,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalPrompt: {
        type: String,
        required: true,
        trim: true
    },
    // Favorites support
    isFavorite: {
        type: Boolean,
        default: false
    },
    // Tags support for better filtering
    tags: [{
        type: String,
        trim: true
    }],
    // Cuisine support
    cuisine: {
        type: String,
        trim: true
    },
    // Image support
    imageUrl: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    imageGenerated: {
        type: Boolean,
        default: false
    },
    // NEW FIELDS for tracking image generation failures
    imageGenerationFailed: {
        type: Boolean,
        default: false
    },
    imageGenerationAttempts: {
        type: Number,
        default: 0
    },
    lastImageGenerationAttempt: {
        type: Date,
        default: null
    },
    imageAttribution: imageAttributionSchema,
    // Image generation prompt for reference
    imagePrompt: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Update lastImageGenerationAttempt before saving
recipeSchema.pre('save', function(next) {
    if (this.isModified('imageGenerationAttempts')) {
        this.lastImageGenerationAttempt = new Date();
    }
    next();
});

// Indexes for performance
recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ name: 'text', description: 'text' });
recipeSchema.index({ user: 1, isFavorite: 1 });
recipeSchema.index({ user: 1, imageGenerated: 1 });
recipeSchema.index({ user: 1, imageGenerationFailed: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);