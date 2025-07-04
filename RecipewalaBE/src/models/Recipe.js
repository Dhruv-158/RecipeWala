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
    }
}, {
    timestamps: true
});

// Indexes for performance
recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
