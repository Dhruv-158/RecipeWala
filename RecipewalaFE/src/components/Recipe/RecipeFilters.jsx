import { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

const RecipeFilters = ({ 
  filters, 
  onFiltersChange, 
  availableTags = [],
  availableCuisines = [],
  isLoading = false 
}) => {
  const [showFilters, setShowFilters] = useState(false)

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'French', 
    'Japanese', 'Mediterranean', 'American', 'Middle Eastern', 'Korean'
  ]

  const difficultyOptions = ['easy', 'medium', 'hard']
  const timeOptions = ['15', '30', '60', '120'] // minutes

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters }
    
    if (key === 'tags') {
      const currentTags = newFilters.tags || []
      if (currentTags.includes(value)) {
        newFilters.tags = currentTags.filter(tag => tag !== value)
      } else {
        newFilters.tags = [...currentTags, value]
      }
    } else if (key === 'difficulty') {
      const currentDifficulties = newFilters.difficulty || []
      if (currentDifficulties.includes(value)) {
        newFilters.difficulty = currentDifficulties.filter(d => d !== value)
      } else {
        newFilters.difficulty = [...currentDifficulties, value]
      }
    } else {
      newFilters[key] = value === newFilters[key] ? null : value
    }
    
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
    setShowFilters(false)
  }

  const activeFilterCount = Object.values(filters).filter(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isLoading}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filter Recipes</h3>
            <div className="flex items-center space-x-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
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
            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <select
                value={filters.cuisine || ''}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Cuisines</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="space-y-2">
                {difficultyOptions.map(difficulty => (
                  <label key={difficulty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.difficulty || []).includes(difficulty)}
                      onChange={() => handleFilterChange('difficulty', difficulty)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm capitalize">{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Cook Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Cook Time: {filters.maxTime ? `${filters.maxTime} min` : 'Any'}
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={filters.maxTime || 120}
                onChange={(e) => handleFilterChange('maxTime', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>15m</span>
                <span>1h</span>
                <span>2h</span>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableTags.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.tags || []).includes(tag)}
                        onChange={() => handleFilterChange('tags', tag)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm truncate">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Only */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.favoritesOnly || false}
                  onChange={(e) => handleFilterChange('favoritesOnly', e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm">Favorites only</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeFilters