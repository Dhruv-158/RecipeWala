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
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { generateRecipe, clearError, clearCurrentRecipe } from '../../features/recipes/recipeSlice'
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
  const [showSuccess, setShowSuccess] = useState(false)

  // Add debug logging
  console.log('RecipeGenerator - Redux State:', {
    currentRecipe,
    isGenerating,
    error,
    showSuccess
  })

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
      setShowSuccess(false)
    }
  }, [error])

  // Show success state when recipe is generated
  useEffect(() => {
    console.log('Success effect - checking conditions:', {
      currentRecipe: !!currentRecipe,
      isGenerating,
      error: !!error,
      recipeId: currentRecipe?.id || currentRecipe?._id,
      recipeName: currentRecipe?.name || currentRecipe?.title
    })
    
    if (currentRecipe && !isGenerating && !error) {
      console.log('✅ Setting showSuccess to true')
      setShowSuccess(true)
      // Auto-scroll to success section
      setTimeout(() => {
        const element = document.getElementById('recipe-success')
        console.log('Scrolling to element:', element)
        element?.scrollIntoView({ 
          behavior: 'smooth' 
        })
      }, 100)
    } else {
      console.log('❌ Not showing success - conditions not met')
    }
  }, [currentRecipe, isGenerating, error])

  const onSubmit = async (data) => {
    try {
      console.log('📝 Submitting recipe generation:', data)
      setShowSuccess(false)
      dispatch(clearError())
      const result = await dispatch(generateRecipe(data)).unwrap()
      console.log('✅ Recipe generation result:', result)
      toast.success('Recipe generated successfully!')
    } catch (err) {
      console.error('❌ Recipe generation failed:', err)
      setShowSuccess(false)
    }
  }

  const handleRegenerateRecipe = () => {
    const formData = {
      recipeName: watchedRecipeName,
      // Add other form values as needed from the form
    }
    setShowSuccess(false)
    onSubmit(formData)
  }

  const handleViewRecipe = () => {
    if (currentRecipe && (currentRecipe.id || currentRecipe._id)) {
      navigate(`/recipes/${currentRecipe.id || currentRecipe._id}`)
    }
  }

  const handleGenerateAnother = () => {
    setShowSuccess(false)
    dispatch(clearCurrentRecipe())
    reset()
    // Scroll back to the form
    setTimeout(() => {
      document.getElementById('recipe-form')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
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
      <div id="recipe-form" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Recipe Input */}
          <div>
            <label htmlFor="recipeName" className="block text-lg font-semibold text-gray-900 mb-2">
              What would you like to cook? ✨
            </label>
            <div className="relative">
              <ChefHat className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                {...register('recipeName')}
                type="text"
                id="recipeName"
                className={`w-full pl-12 pr-3 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                  errors.recipeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Pani Puri, Chocolate chip cookies, Healthy salad..."
                disabled={isGenerating}
              />
            </div>
            {errors.recipeName && (
              <p className="mt-1 text-sm text-red-600">{errors.recipeName.message}</p>
            )}
            
            {/* Quick Suggestions */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
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

      {/* Success State with Navigation */}
      {showSuccess && currentRecipe && !isGenerating && (currentRecipe.id || currentRecipe._id) && (
        <div id="recipe-success" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Recipe Generated Successfully! 🎉</h2>
            </div>
            <p className="text-green-100">
              Your delicious recipe for "{currentRecipe.title || currentRecipe.name}" is ready!
            </p>
          </div>

          {/* Recipe Preview */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentRecipe.title || currentRecipe.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentRecipe.description || 'A delicious AI-generated recipe just for you!'}
              </p>
              
              {/* Quick Recipe Info */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{currentRecipe.cookTime || currentRecipe.prepTime || '30 mins'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{currentRecipe.servings || 4} servings</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChefHat className="h-4 w-4" />
                  <span className="capitalize">{currentRecipe.difficulty || 'Medium'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewRecipe}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Eye className="h-5 w-5" />
                <span>View Full Recipe</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleRegenerateRecipe}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Regenerate Recipe</span>
              </button>
              
              <button
                onClick={handleGenerateAnother}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Generate Another</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>Pro Tip:</strong> Your recipe has been saved automatically. 
                    {!currentRecipe.imageGenerated && ' An AI image is being generated and will appear shortly!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeGenerator