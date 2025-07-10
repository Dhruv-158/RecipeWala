// UPDATE: src/pages/Recipes/RecipeGenerator.jsx
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  Users, 
  RefreshCw,
  Save,
  Eye,
  Loader2,
  Lightbulb,
  Settings
} from 'lucide-react'
import { generateRecipe, clearError } from '../../features/recipes/recipeSlice'
import toast from 'react-hot-toast'
import logoImg from '../../assets/images/logo.png'

// Validation schema
const recipeSchema = yup.object({
  recipeName: yup
    .string()
    .required('Recipe name is required')
    .min(3, 'Recipe name must be at least 3 characters')
    .max(100, 'Recipe name must be less than 100 characters'),
  cuisine: yup.string().optional(),
  dietaryRestrictions: yup.array().optional(),
  servings: yup.number().min(1).max(20).optional(),
  cookingTime: yup.string().optional(),
  difficulty: yup.string().optional(),
  ingredients: yup.string().optional(),
  instructions: yup.string().optional(),
})

const RecipeGenerator = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentRecipe, isGenerating, error } = useSelector((state) => state.recipes)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(recipeSchema),
    defaultValues: {
      servings: 4,
      difficulty: 'medium',
      cookingTime: '30-60 minutes',
      dietaryRestrictions: []
    }
  })

  const watchedRecipeName = watch('recipeName')

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const onSubmit = async (data) => {
    try {
      dispatch(clearError())
      const result = await dispatch(generateRecipe(data)).unwrap()
      toast.success('Recipe generated successfully!')
      
      // Scroll to recipe display
      setTimeout(() => {
        document.getElementById('generated-recipe')?.scrollIntoView({ 
          behavior: 'smooth' 
        })
      }, 100)
    } catch (err) {
      console.error('Recipe generation failed:', err)
    }
  }

  const handleRegenerateRecipe = () => {
    const formData = {
      recipeName: watchedRecipeName,
      // Add other form values as needed
    }
    onSubmit(formData)
  }

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'French', 
    'Japanese', 'Mediterranean', 'American', 'Middle Eastern'
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Paleo', 'Low-Carb', 'High-Protein'
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Easy (15-30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'hard', label: 'Hard (60+ min)' }
  ]

  const timeOptions = [
    '15-30 minutes',
    '30-60 minutes',
    '1-2 hours',
    '2+ hours'
  ]

  const quickSuggestions = [
    'Palak Paneer',
    'Pani Puri',
    'Dhokla',
    'Undhiyu',
    'Thepla',
    'Veg Upma',
    'Pav Bhaji',
    'Poha',
    'Aloo Paratha'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-3xl font-bold">AI Recipe Generator</h1>
        </div>
        <p className="text-orange-100">
          Describe your ideal dish and let our AI chef create a perfect recipe for you!
        </p>
      </div>

      {/* Recipe Generation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Recipe Input */}
          <div>
            <label htmlFor="recipeName" className="block text-lg font-semibold text-gray-900 mb-2">
              What would you like to cook? ✨
            </label>
            <div className="relative">
              <ChefHat className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('recipeName')}
                type="text"
                id="recipeName"
                className={`w-full pl-12 pr-3 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                  errors.recipeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Spicy chicken curry, Chocolate chip cookies, Healthy salad..."
                disabled={isGenerating}
              />
            </div>
            {errors.recipeName && (
              <p className="mt-1 text-sm text-red-600">{errors.recipeName.message}</p>
            )}
            
            {/* Quick Suggestions */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setValue('recipeName', suggestion)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-100 hover:text-orange-700 transition-colors"
                    disabled={isGenerating}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
              disabled={isGenerating}
            >
              <Settings className="h-4 w-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cuisine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Type
                  </label>
                  <select
                    {...register('cuisine')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isGenerating}
                  >
                    <option value="">Any cuisine</option>
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine.toLowerCase()}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Servings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="inline h-4 w-4 mr-1" />
                    Servings
                  </label>
                  <input
                    {...register('servings')}
                    type="number"
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isGenerating}
                  />
                </div>

                {/* Cooking Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Cooking Time
                  </label>
                  <select
                    {...register('cookingTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isGenerating}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isGenerating}
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dietaryOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        {...register('dietaryRestrictions')}
                        type="checkbox"
                        value={option.toLowerCase()}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        disabled={isGenerating}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  {...register('instructions')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Make it extra spicy, use only organic ingredients, avoid nuts..."
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isGenerating || !watchedRecipeName?.trim()}
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Recipe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <img src={logoImg} alt="RecipeWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain rounded-xl lg:rounded-2xl bg-white shadow-lg" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your Recipe...
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI chef is working on something delicious for you!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>This may take a few seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* Button to view generated recipe */}
      {/* {currentRecipe && !isGenerating && (currentRecipe.id || currentRecipe._id) && (
        <>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate(`/recipes/${currentRecipe.id || currentRecipe._id}`)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              View This Recipe
            </button>
          </div>
          <div id="generated-recipe" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <RecipeDisplay 
              recipe={currentRecipe} 
              onRegenerate={handleRegenerateRecipe}
              onSave={() => toast.success('Recipe saved!')}
              onView={() => navigate(`/recipes/${recentRecipe.id || recentRecipe._id}`)}
            />
          </div>
        </>
      )} */}
    </div>
  )
}

// Recipe Display Component
const RecipeDisplay = ({ recipe, onRegenerate, onSave, onView }) => {
  const [activeTab, setActiveTab] = useState('ingredients')

  const tabs = [
    { id: 'ingredients', label: 'Ingredients', icon: null },
    { id: 'instructions', label: 'Instructions', icon: null },
    { id: 'nutrition', label: 'Nutrition', icon: null },
  ]

  // Helper to get recipe name/title
  const getRecipeTitle = (r) => r.title || r.name || 'Untitled Recipe'
  // Helper to get description
  const getRecipeDescription = (r) => r.description || ''
  // Helper to get ingredients as strings
  const getIngredients = (r) => {
    if (Array.isArray(r.ingredients)) {
      if (typeof r.ingredients[0] === 'string') return r.ingredients
      // If array of objects
      return r.ingredients.map(ing => {
        if (typeof ing === 'string') return ing
        return `${ing.amount || ''} ${ing.unit || ''} ${ing.item || ''}`.trim()
      })
    }
    return []
  }
  // Helper to get instructions as strings
  const getInstructions = (r) => {
    if (Array.isArray(r.instructions)) {
      if (typeof r.instructions[0] === 'string') return r.instructions
      // If array of objects
      return r.instructions.map(step => step.instruction || step.step || step)
    }
    return []
  }

  return (
    <div>
      {/* Recipe Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{getRecipeTitle(recipe)}</h2>
            <p className="text-green-100 mb-4">{getRecipeDescription(recipe)}</p>
            
            {/* Recipe Meta */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.cookTime || '30 mins'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings || 4} servings</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChefHat className="h-4 w-4" />
                <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onRegenerate}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate</span>
            </button>
            <button
              onClick={onSave}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onView}
              className="bg-white text-green-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Content Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'ingredients' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
            <ul className="space-y-2">
              {getIngredients(recipe).length > 0 ? getIngredients(recipe).map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              )) : (
                <li className="text-gray-500">No ingredients available</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <ol className="space-y-4">
              {getInstructions(recipe).length > 0 ? getInstructions(recipe).map((step, index) => (
                <li key={index} className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </li>
              )) : (
                <li className="text-gray-500">No instructions available</li>
              )}
            </ol>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information</h3>
            {recipe.nutrition ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutrition)
                  .filter(([key, _]) => key.toLowerCase() !== 'id' && key.toLowerCase() !== '_id')
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-600 capitalize">{key}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">Nutritional information not available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeGenerator