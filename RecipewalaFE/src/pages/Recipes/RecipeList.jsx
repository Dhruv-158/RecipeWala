import { useState, useEffect, useMemo } from 'react'
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
  MoreVertical,
  X,
  RefreshCw
} from 'lucide-react'
import { fetchUserRecipes, deleteRecipe, toggleFavorite, clearError } from '../../features/recipes/recipeSlice'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import toast from 'react-hot-toast'

const RecipeList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { recipes, isLoading, error, pagination } = useSelector((state) => state.recipes)
  
  // Local state for search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch recipes on component mount (only once)
  useEffect(() => {
    dispatch(clearError())
    dispatch(fetchUserRecipes({
      page: 1,
      limit: 50 // Get more recipes for better client-side filtering
    }))
  }, [dispatch])

  // Set up polling for image updates
  useEffect(() => {
    const checkForImageUpdates = () => {
      const recipesWithoutImages = recipes.filter(recipe => !recipe.imageGenerated)
      if (recipesWithoutImages.length > 0) {
        console.log(`Checking for image updates on ${recipesWithoutImages.length} recipes`)
        dispatch(fetchUserRecipes({
          page: 1,
          limit: 50
        }))
      }
    }

    // Check every 30 seconds for image updates
    const imageUpdateInterval = setInterval(checkForImageUpdates, 30000)

    return () => clearInterval(imageUpdateInterval)
  }, [recipes, dispatch])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Handle recipe deletion
  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await dispatch(deleteRecipe(id)).unwrap()
        toast.success('Recipe deleted successfully')
      } catch (error) {
        toast.error('Failed to delete recipe')
      }
    }
  }

  // Handle favorite toggle
  const handleToggleFavorite = async (id) => {
    try {
      await dispatch(toggleFavorite(id)).unwrap()
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await dispatch(fetchUserRecipes({
        page: 1,
        limit: 50
      })).unwrap()
      toast.success('Recipes refreshed!')
    } catch (error) {
      toast.error('Failed to refresh recipes')
    } finally {
      setRefreshing(false)
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterBy('all')
    setSortBy('newest')
    setDifficultyFilter('')
    setCuisineFilter('')
    setShowFilters(false)
  }

  // Defensive fallback for recipes
  const safeRecipes = Array.isArray(recipes) ? recipes : []

  // Filtered and sorted recipes using useMemo for performance
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...safeRecipes]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(recipe => {
        const title = (recipe.title || recipe.name || '').toLowerCase()
        const description = (recipe.description || '').toLowerCase()
        const ingredients = Array.isArray(recipe.ingredients) 
          ? recipe.ingredients.join(' ').toLowerCase()
          : ''
        
        return title.includes(searchLower) || 
               description.includes(searchLower) || 
               ingredients.includes(searchLower)
      })
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'favorites':
          filtered = filtered.filter(recipe => recipe.isFavorite)
          break
        case 'recent':
          // Filter recipes from last 7 days
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter(recipe => {
            const createdAt = new Date(recipe.createdAt)
            return createdAt >= weekAgo
          })
          break
        default:
          break
      }
    }

    // Apply difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(recipe => 
        (recipe.difficulty || 'medium').toLowerCase() === difficultyFilter.toLowerCase()
      )
    }

    // Apply cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter(recipe => 
        (recipe.cuisine || '').toLowerCase().includes(cuisineFilter.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'name':
          const nameA = (a.title || a.name || '').toLowerCase()
          const nameB = (b.title || b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        case 'cookTime':
          const timeA = parseInt((a.cookTime || '30').replace(/\D/g, '')) || 30
          const timeB = parseInt((b.cookTime || '30').replace(/\D/g, '')) || 30
          return timeA - timeB
        case 'difficulty':
          const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
          const diffA = diffOrder[(a.difficulty || 'medium').toLowerCase()] || 2
          const diffB = diffOrder[(b.difficulty || 'medium').toLowerCase()] || 2
          return diffA - diffB
        default:
          return 0
      }
    })

    return filtered
  }, [safeRecipes, searchTerm, filterBy, sortBy, difficultyFilter, cuisineFilter])

  // Get unique cuisines and difficulties for filter options
  const availableCuisines = useMemo(() => {
    const cuisines = safeRecipes
      .map(recipe => recipe.cuisine)
      .filter(Boolean)
      .filter((cuisine, index, arr) => arr.indexOf(cuisine) === index)
    return cuisines.sort()
  }, [safeRecipes])

  const availableDifficulties = ['Easy', 'Medium', 'Hard']

  const filterOptions = [
    { value: 'all', label: 'All Recipes' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'recent', label: 'Recent (7 days)' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'cookTime', label: 'Cook Time (Short to Long)' },
    { value: 'difficulty', label: 'Difficulty (Easy to Hard)' }
  ]

  // Count active filters
  const activeFiltersCount = [
    searchTerm.trim(),
    filterBy !== 'all',
    difficultyFilter,
    cuisineFilter,
    sortBy !== 'newest'
  ].filter(Boolean).length

  // Count recipes without images for status display
  const recipesWithoutImages = safeRecipes.filter(recipe => !recipe.imageGenerated).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => dispatch(fetchUserRecipes({ page: 1, limit: 50 }))}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (safeRecipes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
            <p className="text-gray-600">No recipes in your collection yet</p>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Recipe</span>
          </button>
        </div>
        <EmptyState onGenerateRecipe={() => navigate('/generate')} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              {filteredAndSortedRecipes.length} of {safeRecipes.length} recipes
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            {recipesWithoutImages > 0 && (
              <span className="text-orange-600">
                {recipesWithoutImages} images generating...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh recipes"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/generate')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes by name, description, or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Left side - Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Filter Recipes</h3>
                      <div className="flex items-center space-x-2">
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-orange-600 hover:text-orange-700"
                          >
                            Clear all
                          </button>
                        )}
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={filterBy}
                          onChange={(e) => setFilterBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Difficulty Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                        <select
                          value={difficultyFilter}
                          onChange={(e) => setDifficultyFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">All Difficulties</option>
                          {availableDifficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty.toLowerCase()}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cuisine Filter */}
                      {availableCuisines.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                          <select
                            value={cuisineFilter}
                            onChange={(e) => setCuisineFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">All Cuisines</option>
                            {availableCuisines.map((cuisine) => (
                              <option key={cuisine} value={cuisine}>
                                {cuisine}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Active filter indicators */}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Search: "{searchTerm.slice(0, 20)}{searchTerm.length > 20 ? '...' : ''}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {filterOptions.find(f => f.value === filterBy)?.label}
                  <button
                    onClick={() => setFilterBy('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {difficultyFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)}
                  <button
                    onClick={() => setDifficultyFilter('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {cuisineFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {cuisineFilter}
                  <button
                    onClick={() => setCuisineFilter('')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Right side - Sort control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
      </div>

      {/* Results */}
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No recipes match "${searchTerm}". Try adjusting your search or filters.`
              : 'No recipes match your current filters. Try adjusting your filters.'
            }
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id || recipe._id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id || recipe._id}`)}
              onEdit={() => navigate(`/recipes/${recipe.id || recipe._id}/edit`)}
              onDelete={() => handleDeleteRecipe(recipe.id || recipe._id)}
              onToggleFavorite={() => handleToggleFavorite(recipe.id || recipe._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Recipe Card Component with image generation status
const RecipeCard = ({ recipe, onView, onEdit, onDelete, onToggleFavorite }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [imageError, setImageError] = useState(false)

  const recipeTitle = recipe?.title || recipe?.name || 'Untitled Recipe'
  const recipeDescription = recipe?.description || 'No description available'

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image */}
      <div className="h-48 relative overflow-hidden group">
        {recipe?.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipeTitle}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
            <ChefHat className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Top overlay with buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
          >
            <Heart className={`h-4 w-4 ${recipe?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Image Status */}
          {recipe?.imageGenerated && recipe?.imageUrl && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              AI Generated
            </div>
          )}
          
          {!recipe?.imageGenerated && !recipe?.imageUrl && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
              Generating...
            </div>
          )}

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye className="h-3 w-3" />
                  <span className="text-sm">View</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="h-3 w-3" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
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

        {/* Bottom overlay for image attribution */}
        {recipe?.imageAttribution && recipe.imageAttribution.photographer && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-xs opacity-80">
              Photo by{' '}
              <a 
                href={recipe.imageAttribution.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {recipe.imageAttribution.photographer}
              </a>
              {' '}on{' '}
              <a 
                href={recipe.imageAttribution.unsplashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                Unsplash
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {recipeTitle}
        </h3>
        {recipeDescription && recipeDescription !== 'No description available' && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipeDescription}
          </p>
        )}

        {/* Recipe Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{recipe?.cookTime || recipe?.prepTime || '30 mins'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{recipe?.servings || 4}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="h-3 w-3" />
            <span className="capitalize">{recipe?.difficulty || 'Medium'}</span>
          </div>
        </div>

        {/* Tags */}
        {recipe?.tags && recipe.tags.length > 0 && (
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