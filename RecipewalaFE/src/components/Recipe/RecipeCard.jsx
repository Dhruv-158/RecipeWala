import { useState } from 'react'
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Star
} from 'lucide-react'

const RecipeCard = ({ 
  recipe, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  showActions = true,
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const formatCookTime = (time) => {
    if (!time) return '30 mins'
    if (typeof time === 'number') return `${time} mins`
    return time
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Recipe Image */}
      <div className="h-48 relative overflow-hidden">
        {recipe.image && !imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Overlay elements */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
          {showActions && (
            <>
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(recipe.id)
                }}
                className="absolute top-2 left-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
              >
                <Heart className={`h-4 w-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>

              {/* Rating */}
              {recipe.rating && (
                <div className="absolute top-2 right-12 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span>{recipe.rating}</span>
                </div>
              )}

              {/* Menu Button */}
              <div className="absolute top-2 right-2 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onView?.(recipe.id)
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Eye className="h-3 w-3" />
                      <span className="text-sm">View</span>
                    </button>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(recipe.id)
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="text-sm">Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(recipe.id)
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="text-sm">Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatCookTime(recipe.cookTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings || 4}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="h-3 w-3" />
            <span className={`capitalize ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty || 'Medium'}
            </span>
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
          onClick={() => onView?.(recipe.id)}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          View Recipe
        </button>
      </div>
    </div>
  )
}

export default RecipeCard