import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Share2,
  Download,
  Edit,
  Trash2,
  Printer,
  Star,
  BookOpen
} from 'lucide-react'
import { getRecipeById, deleteRecipe } from '../../features/recipes/recipeSlice'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import toast from 'react-hot-toast'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentRecipe: recipe, isLoading } = useSelector(state => state.recipes)
  const [activeTab, setActiveTab] = useState('ingredients')
  const [servings, setServings] = useState(4)

  // Fetch recipe details from Redux
  useEffect(() => {
    if (id) {
      dispatch(getRecipeById(id)).then((action) => {
        if (action.error) {
          toast.error('Failed to load recipe')
          navigate('/recipes')
        }
      })
    }
    // eslint-disable-next-line
  }, [id, dispatch, navigate])

  // Reset servings when recipe changes
  useEffect(() => {
    if (recipe && recipe.servings) {
      setServings(recipe.servings)
    }
  }, [recipe])

  const handleServingsChange = (newServings) => {
    setServings(Math.max(1, newServings))
  }

  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await dispatch(deleteRecipe(id)).unwrap()
        toast.success('Recipe deleted successfully')
        navigate('/recipes')
      } catch (error) {
        toast.error('Failed to delete recipe')
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Recipe link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const calculateIngredients = (ingredients, originalServings, newServings) => {
    const ratio = newServings / originalServings
    return ingredients.map(ingredient => {
      // If ingredient is a string, scale as before
      if (typeof ingredient === 'string') {
        const numbers = ingredient.match(/\d+\.?\d*/g)
        if (numbers) {
          let scaledIngredient = ingredient
          numbers.forEach(num => {
            const scaledNum = (parseFloat(num) * ratio).toFixed(2).replace(/\.?0+$/, '')
            scaledIngredient = scaledIngredient.replace(num, scaledNum)
          })
          return scaledIngredient
        }
        return ingredient
      }
      // If ingredient is an object, format and scale quantity
      if (typeof ingredient === 'object' && ingredient !== null) {
        const qty = ingredient.quantity ? (ingredient.quantity * ratio).toFixed(2).replace(/\.?0+$/, '') : ''
        const unit = ingredient.unit || ''
        const name = ingredient.name || ''
        return [qty, unit, name].filter(Boolean).join(' ').trim()
      }
      // Fallback for unexpected types
      return String(ingredient)
    })
  }

  const tabs = [
    { id: 'ingredients', label: 'Ingredients', icon: BookOpen },
    { id: 'instructions', label: 'Instructions', icon: ChefHat },
    { id: 'nutrition', label: 'Nutrition', icon: null },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe not found</h2>
        <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/recipes')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Recipes
        </button>
      </div>
    )
  }

  const scaledIngredients = recipe.ingredients ? 
    calculateIngredients(recipe.ingredients, recipe.servings || 4, servings) : 
    []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recipes')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Recipes</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors no-print"
          >
            <Printer className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigate(`/recipes/${id}/edit`)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors no-print"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleDeleteRecipe}
            className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600 no-print"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recipe Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-orange-100 mb-4">{recipe.description}</p>
          
          {/* Recipe Meta */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Clock className="h-5 w-5" />
              <span>{recipe.cookTime || '30 mins'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-5 w-5" />
              <span>{recipe.servings || 4} servings</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="h-5 w-5" />
              <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
            </div>
            {recipe.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-current" />
                <span>{recipe.rating}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Servings Adjuster */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Adjust Servings:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleServingsChange(servings - 1)}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                -
              </button>
              <span className="text-lg font-semibold w-8 text-center">{servings}</span>
              <button
                onClick={() => handleServingsChange(servings + 1)}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                +
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
                className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'ingredients' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ingredients {servings !== (recipe.servings || 4) && `(scaled for ${servings} servings)`}
              </h3>
              <ul className="space-y-3">
                {scaledIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <ol className="space-y-4">
                {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((step, index) => {
                    let text = ''
                    if (typeof step === 'string') text = step
                    else if (typeof step === 'object' && step !== null) text = step.instruction || step.step || JSON.stringify(step)
                    return (
                      <li key={index} className="flex space-x-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 pt-1 leading-relaxed">{text}</p>
                      </li>
                    )
                  })
                ) : (
                  <li className="text-gray-500">No instructions available</li>
                )}
              </ol>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nutritional Information {servings !== (recipe.servings || 4) && `(per serving, scaled)`}
              </h3>
              {recipe.nutrition && typeof recipe.nutrition === 'object' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutrition)
                    .filter(([key, _]) => key.toLowerCase() !== 'id' && key.toLowerCase() !== '_id')
                    .map(([key, value]) => {
                      // If value is an object or array, skip or stringify
                      let displayValue = value
                      if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value)
                      } else if (typeof value === 'number' && servings !== (recipe.servings || 4)) {
                        displayValue = Math.round(value * servings / (recipe.servings || 4))
                      }
                      return (
                        <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-gray-500">Nutritional information not available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Notes */}
      {recipe.notes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Chef's Notes</p>
              <div className="mt-1 text-sm text-yellow-700">
                {recipe.notes}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeDetail