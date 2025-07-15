import { useState, useEffect } from 'react'
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Star,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { recipeService } from '../../services/recipeService'
import toast from 'react-hot-toast'

const RecipeCard = ({ 
  recipe, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  showActions = true,
  className = '' 
}) => {
  // Debug logging
  console.log('RecipeCard - Recipe object:', recipe)
  console.log('RecipeCard - Image URL:', recipe?.imageUrl)
  console.log('RecipeCard - Thumbnail URL:', recipe?.thumbnailUrl)
  console.log('RecipeCard - Image Generated:', recipe?.imageGenerated)
  
  const [showMenu, setShowMenu] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(recipe?.imageUrl || recipe?.thumbnailUrl)

  useEffect(() => {
    console.log('RecipeCard useEffect - recipe changed:', recipe)
    const newImageUrl = recipe?.imageUrl || recipe?.thumbnailUrl
    console.log('RecipeCard useEffect - new image URL:', newImageUrl)
    setCurrentImageUrl(newImageUrl)
    setImageError(false)
  }, [recipe?.imageUrl, recipe?.thumbnailUrl, recipe?.id, recipe?._id])

  const handleImageError = () => {
    console.log('RecipeCard - Image error for URL:', currentImageUrl)
    setImageError(true)
  }

  const generateImage = async () => {
    if (imageLoading) return
    
    setImageLoading(true)
    try {
      const response = await recipeService.generateRecipeImage(recipe.id || recipe._id)
      if (response.data.imageUrl) {
        setCurrentImageUrl(response.data.imageUrl)
        setImageError(false)
        toast.success('Image generated successfully!')
        
        // Optionally trigger a recipe refresh to update the parent component
        window.dispatchEvent(new CustomEvent('recipeImageGenerated', {
          detail: { 
            recipeId: recipe.id || recipe._id, 
            imageUrl: response.data.imageUrl 
          }
        }))
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error('Failed to generate image')
    } finally {
      setImageLoading(false)
    }
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

  // Safe property access with fallbacks
  const recipeTitle = recipe?.title || recipe?.name || 'Untitled Recipe'
  const recipeDescription = recipe?.description || 'No description available'

  console.log('RecipeCard - Final values:', {
    title: recipeTitle,
    description: recipeDescription,
    currentImageUrl,
    imageError,
    imageGenerated: recipe?.imageGenerated
  })

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Recipe Image */}
      <div className="h-48 relative overflow-hidden group">
        {currentImageUrl && !imageError ? (
          <img
            src={currentImageUrl}
            alt={recipeTitle}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
            <ChefHat className="h-12 w-12 text-white opacity-50" />
            
            {/* Generate Image Button */}
            {!recipe?.imageGenerated && !imageLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  generateImage()
                }}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center group"
                title="Generate AI image for this recipe"
              >
                <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform">
                  <ImageIcon className="h-6 w-6 text-gray-700" />
                </div>
              </button>
            )}
            
            {/* Loading State */}
            {imageLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <Loader2 className="h-6 w-6 text-gray-700 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Top overlay with buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('RecipeCard - Favorite clicked for recipe:', recipe?.id || recipe?._id)
              onToggleFavorite()
            }}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
          >
            <Heart className={`h-4 w-4 ${recipe?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Image Status Indicator */}
          {recipe?.imageGenerated && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              AI Generated
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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
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
                {!recipe?.imageGenerated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateImage()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    disabled={imageLoading}
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span className="text-sm">Generate Image</span>
                  </button>
                )}
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
            <span>{formatCookTime(recipe?.cookTime || recipe?.prepTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{recipe?.servings || 4}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="h-3 w-3" />
            <span className={`capitalize ${getDifficultyColor(recipe?.difficulty)}`}>
              {recipe?.difficulty || 'Medium'}
            </span>
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

export default RecipeCard