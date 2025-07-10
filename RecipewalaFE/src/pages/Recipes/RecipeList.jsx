import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  ChefHat,
  Plus,
  Eye,
  Heart,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react'
import { fetchUserRecipes, clearError } from '../../features/recipes/recipeSlice'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import toast from 'react-hot-toast'

const RecipeList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { recipes, isLoading, error, pagination } = useSelector((state) => state.recipes)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch recipes on component mount
  useEffect(() => {
    dispatch(clearError())
    dispatch(fetchUserRecipes({
      page: 1,
      limit: 12,
      search: searchTerm,
      filter: filterBy,
      sort: sortBy
    }))
  }, [dispatch, searchTerm, filterBy, sortBy])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (filter) => {
    setFilterBy(filter)
    setShowFilters(false)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
  }

  const filterOptions = [
    { value: 'all', label: 'All Recipes' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'recent', label: 'Recent' },
    { value: 'cuisine', label: 'By Cuisine' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'cookTime', label: 'Cook Time' }
  ]

  // Defensive fallback for recipes and pagination
  const safeRecipes = Array.isArray(recipes) ? recipes : []
  const safePagination = pagination || { current: 1, pages: 1, total: 0 }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => dispatch(fetchUserRecipes({ page: 1, limit: 12 }))}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoading && safeRecipes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No recipes found. Try generating a new recipe!</p>
          <button
            onClick={() => navigate('/generate')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Generate Recipe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
          <p className="text-gray-600">
            {safeRecipes.length} {safeRecipes.length === 1 ? 'recipe' : 'recipes'} in your collection
          </p>
        </div>
        <button
          onClick={() => navigate('/generate')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>{filterOptions.find(f => f.value === filterBy)?.label}</span>
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        filterBy === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {safeRecipes.length === 0 ? (
        <EmptyState onGenerateRecipe={() => navigate('/generate')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id}`)}
              onEdit={() => navigate(`/recipes/${recipe.id}/edit`)}
              onDelete={() => handleDeleteRecipe(recipe.id)}
              onToggleFavorite={() => handleToggleFavorite(recipe.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {safePagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            disabled={safePagination.current === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {safePagination.current} of {safePagination.pages}
          </span>
          <button
            disabled={safePagination.current === safePagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Recipe Card Component
const RecipeCard = ({ recipe, onView, onEdit, onDelete, onToggleFavorite }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image */}
      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <ChefHat className="h-12 w-12 text-white opacity-50" />
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 left-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
        >
          <Heart className={`h-4 w-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Menu Button */}
        <div className="absolute top-2 right-2 relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onView()
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Eye className="h-3 w-3" />
                <span className="text-sm">View</span>
              </button>
              <button
                onClick={() => {
                  onEdit()
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit className="h-3 w-3" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>

        {/* Recipe Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
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

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* View Button */}
        <button
          onClick={onView}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          View Recipe
        </button>
      </div>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ onGenerateRecipe }) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start building your recipe collection by generating your first AI-powered recipe!
      </p>
      <button
        onClick={onGenerateRecipe}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 mx-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Generate Your First Recipe</span>
      </button>
    </div>
  )
}

export default RecipeList