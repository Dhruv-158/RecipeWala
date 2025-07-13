import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Plus, 
  Folder, 
  Calendar, 
  ShoppingCart,
  Grid,
  List,
  Search,
  Edit2,
  Trash2,
  Heart,
  ChefHat,
  Clock,
  Users,
  X,
  Save,
  FolderPlus,
  Star,
  Filter,
  MoreVertical
} from 'lucide-react'
import { fetchUserRecipes } from '../../features/recipes/recipeSlice'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import toast from 'react-hot-toast'

// Edit Meal Plan Modal
const EditMealPlanModal = ({ mealPlan, onClose, onSave, recipes }) => {
  const [name, setName] = useState(mealPlan.name || '')
  const [description, setDescription] = useState(mealPlan.description || '')
  const [duration, setDuration] = useState(mealPlan.duration || 7)
  const [meals, setMeals] = useState(mealPlan.meals || {})
  const [activeTab, setActiveTab] = useState('details')

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Meal plan name is required')
      return
    }

    onSave({
      ...mealPlan,
      name: name.trim(),
      description: description.trim(),
      duration,
      meals,
      updatedAt: new Date().toISOString()
    })
  }

  const addMealToDay = (dayNumber, recipeId, mealType) => {
    const dayKey = `day${dayNumber}`
    const newMeal = { recipeId, type: mealType }
    
    setMeals(prev => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), newMeal]
    }))
  }

  const removeMealFromDay = (dayNumber, mealIndex) => {
    const dayKey = `day${dayNumber}`
    setMeals(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter((_, index) => index !== mealIndex)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Edit Meal Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Plan Details
            </button>
            <button
              onClick={() => setActiveTab('meals')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'meals'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Meal Planning
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., This Week's Menu, Holiday Meals"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe this meal plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={3}>3 days</option>
                  <option value={7}>1 week</option>
                  <option value={14}>2 weeks</option>
                  <option value={30}>1 month</option>
                </select>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Plan Your Meals</h3>
                <p className="text-sm text-gray-600">
                  Drag and drop recipes or click to add meals for each day
                </p>
              </div>

              {/* Meal Planning Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: duration }, (_, dayIndex) => {
                  const dayNumber = dayIndex + 1
                  const dayKey = `day${dayNumber}`
                  const dayMeals = meals[dayKey] || []
                  
                  return (
                    <MealPlanDay
                      key={dayNumber}
                      dayNumber={dayNumber}
                      meals={dayMeals}
                      recipes={recipes}
                      mealTypes={mealTypes}
                      onAddMeal={(recipeId, mealType) => addMealToDay(dayNumber, recipeId, mealType)}
                      onRemoveMeal={(mealIndex) => removeMealFromDay(dayNumber, mealIndex)}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Update Meal Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// Meal Plan Day Component
const MealPlanDay = ({ dayNumber, meals, recipes, mealTypes, onAddMeal, onRemoveMeal }) => {
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const [selectedMealType, setSelectedMealType] = useState('breakfast')

  const handleAddMeal = () => {
    if (selectedRecipe && selectedMealType) {
      onAddMeal(selectedRecipe, selectedMealType)
      setSelectedRecipe('')
      setSelectedMealType('breakfast')
      setShowAddMeal(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Day {dayNumber}</h4>
        <button
          onClick={() => setShowAddMeal(true)}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          + Add Meal
        </button>
      </div>
      
      {/* Existing Meals */}
      <div className="space-y-2 mb-3">
        {meals.map((meal, index) => {
          const recipe = recipes.find(r => (r.id || r._id) === meal.recipeId)
          return (
            <div key={index} className="bg-white rounded p-3 border border-gray-200 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {meal.type}
                    </span>
                    <button
                      onClick={() => onRemoveMeal(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-medium text-sm text-gray-900">
                    {recipe ? (recipe.name || recipe.title) : 'Recipe not found'}
                  </p>
                  {recipe && (
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.cookTime || '30 mins'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings || 4}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Meal Form */}
      {showAddMeal && (
        <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Recipe
              </label>
              <select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select a recipe...</option>
                {recipes.map(recipe => (
                  <option key={recipe.id || recipe._id} value={recipe.id || recipe._id}>
                    {recipe.name || recipe.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddMeal}
                disabled={!selectedRecipe}
                className="flex-1 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddMeal(false)
                  setSelectedRecipe('')
                  setSelectedMealType('breakfast')
                }}
                className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {meals.length === 0 && !showAddMeal && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No meals planned</p>
        </div>
      )}
    </div>
  )
}

// Edit Collection Modal
const EditCollectionModal = ({ collection, onClose, onSave, recipes }) => {
  const [name, setName] = useState(collection.name || '')
  const [description, setDescription] = useState(collection.description || '')
  const [color, setColor] = useState(collection.color || '#f59e0b')
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(collection.recipeIds || [])
  const [searchTerm, setSearchTerm] = useState('')

  const colors = [
    '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#84cc16'
  ]

  const filteredRecipes = recipes.filter(recipe => 
    (recipe.name || recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Collection name is required')
      return
    }

    onSave({
      ...collection,
      name: name.trim(),
      description: description.trim(),
      color,
      recipeIds: selectedRecipeIds,
      updatedAt: new Date().toISOString()
    })
  }

  const toggleRecipe = (recipeId) => {
    if (selectedRecipeIds.includes(recipeId)) {
      setSelectedRecipeIds(selectedRecipeIds.filter(id => id !== recipeId))
    } else {
      setSelectedRecipeIds([...selectedRecipeIds, recipeId])
    }
  }

  const isDefaultCollection = collection.isDefault === true

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Edit Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDefaultCollection 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-white'
                  }`}
                  placeholder="e.g., Weekend Specials, Healthy Options"
                  required
                  disabled={isDefaultCollection}
                  readOnly={isDefaultCollection}
                />
                {isDefaultCollection && (
                  <p className="text-xs text-gray-500 mt-1">Default collection name cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(colorOption => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => !isDefaultCollection && setColor(colorOption)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        color === colorOption ? 'border-gray-800' : 'border-gray-200'
                      } ${isDefaultCollection ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 transition-transform'}`}
                      style={{ backgroundColor: colorOption }}
                      disabled={isDefaultCollection}
                    />
                  ))}
                </div>
                {isDefaultCollection && (
                  <p className="text-xs text-gray-500 mt-1">Default collection color cannot be changed</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDefaultCollection 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed resize-none' 
                    : 'bg-white'
                }`}
                placeholder="Describe this collection..."
                disabled={isDefaultCollection}
                readOnly={isDefaultCollection}
              />
              {isDefaultCollection && (
                <p className="text-xs text-gray-500 mt-1">Default collection description cannot be changed</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Recipes ({selectedRecipeIds.length} selected)
              </label>
              
              {/* Recipe Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Recipe List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredRecipes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No recipes found' : 'No recipes available'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRecipes.map(recipe => (
                      <label
                        key={recipe.id || recipe._id}
                        className={`flex items-center p-3 hover:bg-gray-50 ${
                          isDefaultCollection ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRecipeIds.includes(recipe.id || recipe._id)}
                          onChange={() => !isDefaultCollection && toggleRecipe(recipe.id || recipe._id)}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          disabled={isDefaultCollection}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <ChefHat className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {recipe.name || recipe.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {recipe.cookTime || '30 mins'} • {recipe.difficulty || 'Medium'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {isDefaultCollection && (
                <p className="text-xs text-gray-500 mt-2">
                  Default collections automatically manage their recipes. You can view them but cannot manually add/remove recipes.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault()
              if (!name.trim()) {
                toast.error('Collection name is required')
                return
              }

              onSave({
                ...collection,
                name: name.trim(),
                description: description.trim(),
                color,
                recipeIds: selectedRecipeIds,
                updatedAt: new Date().toISOString()
              })
            }}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDefaultCollection}
          >
            {isDefaultCollection ? 'Cannot Edit Default' : 'Update Collection'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Create Collection Modal
const CreateCollectionModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#f59e0b')

  const colors = [
    '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#84cc16'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Collection name is required')
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      recipeIds: [],
      createdAt: new Date().toISOString(),
      isDefault: false
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Weekend Specials, Healthy Options"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe this collection..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(colorOption => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption ? 'border-gray-800' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create Meal Plan Modal
const CreateMealPlanModal = ({ onClose, onSave, recipes }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(7)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Meal plan name is required')
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      duration,
      meals: {},
      createdAt: new Date().toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Meal Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., This Week's Menu, Holiday Meals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe this meal plan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={3}>3 days</option>
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
              <option value={30}>1 month</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Create Meal Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Meal Plan Detail Modal
const MealPlanDetailModal = ({ mealPlan, recipes, onClose, onEdit }) => {
  const totalRecipes = Object.values(mealPlan.meals || {}).flat().length
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-green-500 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
              <p className="text-white text-opacity-90 mt-1">
                {mealPlan.description || 'No description'}
              </p>
              <p className="text-white text-opacity-75 text-sm mt-2">
                {mealPlan.duration || 7} days • {totalRecipes} meals planned
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Meal Plan Overview</h2>
                <p className="text-sm text-gray-600">
                  Created on {new Date(mealPlan.createdAt).toLocaleDateString()}
                  {mealPlan.updatedAt && mealPlan.updatedAt !== mealPlan.createdAt && (
                    <span> • Updated on {new Date(mealPlan.updatedAt).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
              
              <button
                onClick={onEdit}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Meal Plan</span>
              </button>
            </div>
          </div>

          {/* Meal Plan Content */}
          <div className="p-6">
            {Object.keys(mealPlan.meals || {}).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meals planned yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by editing this meal plan to add meals for each day.
                </p>
                <button
                  onClick={onEdit}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Your First Meal
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meal Plan Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: mealPlan.duration || 7 }, (_, dayIndex) => {
                    const dayNumber = dayIndex + 1
                    const dayMeals = mealPlan.meals[`day${dayNumber}`] || []
                    
                    return (
                      <div key={dayIndex} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Day {dayNumber}
                        </h4>
                        
                        {dayMeals.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">No meals planned</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayMeals.map((meal, mealIndex) => {
                              const recipe = recipes.find(r => 
                                (r.id || r._id) === meal.recipeId
                              )
                              
                              return (
                                <div
                                  key={mealIndex}
                                  className="bg-white rounded p-3 border border-gray-200"
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      {meal.type || 'meal'}
                                    </span>
                                  </div>
                                  <p className="font-medium text-sm text-gray-900">
                                    {recipe ? (recipe.name || recipe.title) : 'Recipe not found'}
                                  </p>
                                  {recipe && (
                                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{recipe.cookTime || '30 mins'}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>{recipe.servings || 4}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Plan Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{mealPlan.duration || 7}</div>
                      <div className="text-sm text-gray-600">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalRecipes}</div>
                      <div className="text-sm text-gray-600">Meals Planned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(Object.values(mealPlan.meals || {}).flat().map(m => m.recipeId)).size}
                      </div>
                      <div className="text-sm text-gray-600">Unique Recipes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((totalRecipes / ((mealPlan.duration || 7) * 3)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Collection Detail Modal
const CollectionDetailModal = ({ collection, recipes, onClose, onUpdateCollection }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddRecipes, setShowAddRecipes] = useState(false)

  const collectionRecipes = recipes.filter(recipe => 
    collection.recipeIds.includes(recipe.id || recipe._id)
  )

  const filteredCollectionRecipes = collectionRecipes.filter(recipe =>
    (recipe.name || recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableRecipes = recipes.filter(recipe => 
    !collection.recipeIds.includes(recipe.id || recipe._id)
  )

  const removeRecipe = (recipeId) => {
    const updatedRecipeIds = collection.recipeIds.filter(id => id !== recipeId)
    const updatedCollection = {
      ...collection,
      recipeIds: updatedRecipeIds,
      updatedAt: new Date().toISOString()
    }
    onUpdateCollection(updatedCollection)
    toast.success('Recipe removed from collection')
  }

  const addRecipe = (recipeId) => {
    if (!collection.recipeIds.includes(recipeId)) {
      const updatedRecipeIds = [...collection.recipeIds, recipeId]
      const updatedCollection = {
        ...collection,
        recipeIds: updatedRecipeIds,
        updatedAt: new Date().toISOString()
      }
      onUpdateCollection(updatedCollection)
      toast.success('Recipe added to collection')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          className="p-6 text-white relative"
          style={{ backgroundColor: collection.color }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Folder className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              <p className="text-white text-opacity-90 mt-1">
                {collection.description || 'No description'}
              </p>
              <p className="text-white text-opacity-75 text-sm mt-2">
                {collectionRecipes.length} recipes
                {collection.isDefault && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                    Default Collection
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recipes in this collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              {!collection.isDefault && (
                <button
                  onClick={() => setShowAddRecipes(true)}
                  className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Recipes</span>
                </button>
              )}
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="p-6">
            {filteredCollectionRecipes.length === 0 ? (
              <div className="text-center py-12">
                {collectionRecipes.length === 0 ? (
                  <>
                    <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
                    <p className="text-gray-600 mb-6">
                      {collection.isDefault 
                        ? `This collection will automatically populate with ${collection.name.toLowerCase()}`
                        : 'Add some recipes to get started'
                      }
                    </p>
                    {!collection.isDefault && (
                      <button
                        onClick={() => setShowAddRecipes(true)}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Add Your First Recipe
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                    <p className="text-gray-600">No recipes match "{searchTerm}"</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollectionRecipes.map(recipe => (
                  <RecipeCardInCollection
                    key={recipe.id || recipe._id}
                    recipe={recipe}
                    onView={() => navigate(`/recipes/${recipe.id || recipe._id}`)}
                    onRemove={() => removeRecipe(recipe.id || recipe._id)}
                    canRemove={!collection.isDefault}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Recipes Modal */}
        {showAddRecipes && (
          <AddRecipesToCollectionModal
            availableRecipes={availableRecipes}
            onClose={() => setShowAddRecipes(false)}
            onAddRecipe={addRecipe}
          />
        )}
      </div>
    </div>
  )
}

// Recipe Card in Collection
const RecipeCardInCollection = ({ recipe, onView, onRemove, canRemove }) => {
  const [showMenu, setShowMenu] = useState(false)

  const handleCardClick = (e) => {
    // Don't trigger onView if clicking on menu button or menu items
    if (e.target.closest('.menu-button') || e.target.closest('.menu-dropdown')) {
      return
    }
    onView()
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Recipe Image */}
      <div className="h-32 bg-gradient-to-br from-orange-400 to-red-500 relative">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-white opacity-50" />
          </div>
        )}
        
        {canRemove && (
          <div className="absolute top-2 right-2 menu-button">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 menu-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  View Recipe
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {recipe.name || recipe.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{recipe.cookTime || '30 mins'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings || 4}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="h-3 w-3" />
            <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Recipes to Collection Modal
const AddRecipesToCollectionModal = ({ availableRecipes, onClose, onAddRecipe }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecipes = availableRecipes.filter(recipe =>
    (recipe.name || recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Recipes to Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Recipe List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {availableRecipes.length === 0 
                ? 'All recipes are already in this collection'
                : 'No recipes found'
              }
            </div>
          ) : (
            filteredRecipes.map(recipe => (
              <div
                key={recipe.id || recipe._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {recipe.name || recipe.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {recipe.cookTime || '30 mins'} • {recipe.difficulty || 'Medium'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onAddRecipe(recipe.id || recipe._id)}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Collection Card Component
const CollectionCard = ({ collection, recipes, viewMode, onEdit, onDelete, onView }) => {
  const collectionRecipes = recipes.filter(recipe => 
    collection.recipeIds.includes(recipe.id || recipe._id)
  )

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: collection.color }}
          >
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{collection.name}</h3>
            <p className="text-sm text-gray-600">{collectionRecipes.length} recipes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {!collection.isDefault && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
         onClick={onView}>
      {/* Header */}
      <div 
        className="h-24 flex items-center justify-center text-white relative"
        style={{ backgroundColor: collection.color }}
      >
        <Folder className="h-8 w-8" />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          {!collection.isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{collection.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{collectionRecipes.length} recipes</span>
          {collection.isDefault && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              Default
            </span>
          )}
        </div>

        {/* Recipe Preview */}
        {collectionRecipes.length > 0 && (
          <div className="mt-3 flex space-x-1">
            {collectionRecipes.slice(0, 3).map(recipe => (
              <div
                key={recipe.id || recipe._id}
                className="w-8 h-8 bg-orange-100 rounded text-xs flex items-center justify-center text-orange-600"
                title={recipe.name || recipe.title}
              >
                <ChefHat className="h-3 w-3" />
              </div>
            ))}
            {collectionRecipes.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-600">
                +{collectionRecipes.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Meal Plan Card Component
const MealPlanCard = ({ mealPlan, recipes, viewMode, onEdit, onDelete, onView }) => {
  const totalRecipes = Object.values(mealPlan.meals || {}).flat().length

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{mealPlan.name}</h3>
            <p className="text-sm text-gray-600">{totalRecipes} meals planned</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
         onClick={onView}>
      {/* Header */}
      <div className="h-24 bg-green-500 flex items-center justify-center text-white relative">
        <Calendar className="h-8 w-8" />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{mealPlan.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mealPlan.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{totalRecipes} meals planned</span>
          <span>{mealPlan.duration || '7'} days</span>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ activeTab, searchTerm, onCreateCollection, onCreateMealPlan }) => {
  if (searchTerm) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600 mb-6">
          No {activeTab === 'collections' ? 'collections' : 'meal plans'} match "{searchTerm}"
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      {activeTab === 'collections' ? (
        <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      ) : (
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No {activeTab === 'collections' ? 'collections' : 'meal plans'} yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {activeTab === 'collections' 
          ? 'Create your first recipe collection to organize your favorites and discover new combinations.'
          : 'Create your first meal plan to organize your weekly cooking and shopping.'
        }
      </p>
      <button
        onClick={activeTab === 'collections' ? onCreateCollection : onCreateMealPlan}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 mx-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Create {activeTab === 'collections' ? 'Collection' : 'Meal Plan'}</span>
      </button>
    </div>
  )
}

// Main Collections Component
const Collections = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { recipes, isLoading } = useSelector(state => state.recipes)
  
  // Local state
  const [activeTab, setActiveTab] = useState('collections')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMealPlanModal, setShowMealPlanModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditMealPlanModal, setShowEditMealPlanModal] = useState(false)
  const [showCollectionDetail, setShowCollectionDetail] = useState(false)
  const [showMealPlanDetail, setShowMealPlanDetail] = useState(false)
  const [collections, setCollections] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedMealPlan, setSelectedMealPlan] = useState(null)
  const [editingCollection, setEditingCollection] = useState(null)
  const [editingMealPlan, setEditingMealPlan] = useState(null)

  // Load data on mount
  useEffect(() => {
    dispatch(fetchUserRecipes({ page: 1, limit: 100 }))
    loadCollectionsFromStorage()
    loadMealPlansFromStorage()
  }, [dispatch])

  // Load collections from localStorage (no default collections)
  const loadCollectionsFromStorage = () => {
    try {
      const saved = localStorage.getItem('recipeCollections')
      if (saved) {
        setCollections(JSON.parse(saved))
      } else {
        setCollections([])
        localStorage.setItem('recipeCollections', JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  // Load meal plans from localStorage
  const loadMealPlansFromStorage = () => {
    try {
      const saved = localStorage.getItem('mealPlans')
      if (saved) {
        setMealPlans(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading meal plans:', error)
    }
  }

  // Save collections to localStorage
  const saveCollections = (newCollections) => {
    setCollections(newCollections)
    localStorage.setItem('recipeCollections', JSON.stringify(newCollections))
  }

  // Save meal plans to localStorage
  const saveMealPlans = (newMealPlans) => {
    setMealPlans(newMealPlans)
    localStorage.setItem('mealPlans', JSON.stringify(newMealPlans))
  }

  // Filter out default collections and filter by search
  const userCollections = useMemo(() =>
    collections.filter(
      c => !c.isDefault && c.id !== 'favorites' && c.id !== 'quick-meals'
    ),
    [collections]
  )
  const filteredItems = useMemo(() => {
    const items = activeTab === 'collections' ? userCollections : mealPlans
    if (!searchTerm.trim()) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [userCollections, mealPlans, activeTab, searchTerm])

  const tabs = [
    { id: 'collections', label: 'Collections', icon: Folder, count: collections.length },
    { id: 'meal-plans', label: 'Meal Plans', icon: Calendar, count: mealPlans.length },
  ]

  // Handle delete collection
  function handleDeleteCollection(id) {
    const collection = collections.find(c => c.id === id)
    if (collection?.isDefault) {
      toast.error('Cannot delete default collections')
      return
    }

    if (window.confirm('Are you sure you want to delete this collection?')) {
      const updatedCollections = collections.filter(c => c.id !== id)
      saveCollections(updatedCollections)
      toast.success('Collection deleted successfully!')
    }
  }

  // Handle delete meal plan
  function handleDeleteMealPlan(id) {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      const updatedMealPlans = mealPlans.filter(m => m.id !== id)
      saveMealPlans(updatedMealPlans)
      toast.success('Meal plan deleted successfully!')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <>
      {/* Main Content - space-y-6 only affects this container */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Collections</h1>
            <p className="text-gray-600">Organize your recipes and plan your meals</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => {
                if (activeTab === 'collections') {
                  setShowCreateModal(true)
                } else {
                  setShowMealPlanModal(true)
                }
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New {activeTab === 'collections' ? 'Collection' : 'Meal Plan'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
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
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'collections' ? 'collections' : 'meal plans'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredItems.length === 0 ? (
              <EmptyState
                activeTab={activeTab}
                searchTerm={searchTerm}
                onCreateCollection={() => setShowCreateModal(true)}
                onCreateMealPlan={() => setShowMealPlanModal(true)}
              />
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredItems.map(item => (
                  activeTab === 'collections' ? (
                    <CollectionCard
                      key={item.id}
                      collection={item}
                      recipes={recipes}
                      viewMode={viewMode}
                      onEdit={() => {
                        setEditingCollection(item)
                        setShowEditModal(true)
                      }}
                      onDelete={() => handleDeleteCollection(item.id)}
                      onView={() => {
                        setSelectedCollection(item)
                        setShowCollectionDetail(true)
                      }}
                    />
                  ) : (
                    <MealPlanCard
                      key={item.id}
                      mealPlan={item}
                      recipes={recipes}
                      viewMode={viewMode}
                      onEdit={() => {
                        setEditingMealPlan(item)
                        setShowEditMealPlanModal(true)
                      }}
                      onDelete={() => handleDeleteMealPlan(item.id)}
                      onView={() => {
                        setSelectedMealPlan(item)
                        setShowMealPlanDetail(true)
                      }}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals - Outside of space-y-6 container */}
      {showEditModal && editingCollection && (
        <EditCollectionModal
          collection={editingCollection}
          onClose={() => {
            setShowEditModal(false)
            setEditingCollection(null)
          }}
          onSave={(updatedCollection) => {
            const updatedCollections = collections.map(c => 
              c.id === editingCollection.id ? { ...updatedCollection, id: editingCollection.id } : c
            )
            saveCollections(updatedCollections)
            toast.success('Collection updated successfully!')
            setShowEditModal(false)
            setEditingCollection(null)
          }}
          recipes={recipes}
        />
      )}

      {showEditMealPlanModal && editingMealPlan && (
        <EditMealPlanModal
          mealPlan={editingMealPlan}
          onClose={() => {
            setShowEditMealPlanModal(false)
            setEditingMealPlan(null)
          }}
          onSave={(updatedMealPlan) => {
            const updatedMealPlans = mealPlans.map(m => 
              m.id === editingMealPlan.id ? { ...updatedMealPlan, id: editingMealPlan.id } : m
            )
            saveMealPlans(updatedMealPlans)
            toast.success('Meal plan updated successfully!')
            setShowEditMealPlanModal(false)
            setEditingMealPlan(null)
          }}
          recipes={recipes}
        />
      )}

      {showCollectionDetail && selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          recipes={recipes}
          onClose={() => {
            setShowCollectionDetail(false)
            setSelectedCollection(null)
          }}
          onUpdateCollection={(updatedCollection) => {
            const updatedCollections = collections.map(c => 
              c.id === selectedCollection.id ? { ...updatedCollection, id: selectedCollection.id } : c
            )
            saveCollections(updatedCollections)
            setSelectedCollection(updatedCollection)
          }}
        />
      )}

      {showMealPlanDetail && selectedMealPlan && (
        <MealPlanDetailModal
          mealPlan={selectedMealPlan}
          recipes={recipes}
          onClose={() => {
            setShowMealPlanDetail(false)
            setSelectedMealPlan(null)
          }}
          onEdit={() => {
            setEditingMealPlan(selectedMealPlan)
            setShowMealPlanDetail(false)
            setSelectedMealPlan(null)
            setShowEditMealPlanModal(true)
          }}
        />
      )}

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newCollection) => {
            const updatedCollections = [...collections, { ...newCollection, id: Date.now().toString() }]
            saveCollections(updatedCollections)
            toast.success('Collection created successfully!')
            setShowCreateModal(false)
          }}
        />
      )}

      {showMealPlanModal && (
        <CreateMealPlanModal
          onClose={() => setShowMealPlanModal(false)}
          onSave={(newMealPlan) => {
            const updatedMealPlans = [...mealPlans, { ...newMealPlan, id: Date.now().toString() }]
            saveMealPlans(updatedMealPlans)
            toast.success('Meal plan created successfully!')
            setShowMealPlanModal(false)
          }}
          recipes={recipes}
        />
      )}
    </>
  )
}

export default Collections