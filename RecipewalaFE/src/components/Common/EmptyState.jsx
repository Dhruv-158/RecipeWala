import { Plus, Search, BookOpen } from 'lucide-react'

const EmptyState = ({ 
  type = 'recipes', 
  title, 
  description, 
  actionText, 
  onAction, 
  icon: Icon,
  className = '' 
}) => {
  const getDefaultProps = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: 'No results found',
          description: 'Try adjusting your search terms or filters',
          actionText: 'Clear filters',
        }
      case 'favorites':
        return {
          icon: BookOpen,
          title: 'No favorites yet',
          description: 'Start marking recipes as favorites to see them here',
          actionText: 'Browse recipes',
        }
      case 'collections':
        return {
          icon: Plus,
          title: 'No collections yet',
          description: 'Create your first recipe collection to organize your favorites',
          actionText: 'Create Collection',
        }
      case 'meal-plans':
        return {
          icon: Plus,
          title: 'No meal plans yet',
          description: 'Create your first meal plan to organize your weekly cooking',
          actionText: 'Create Meal Plan',
        }
      case 'shopping':
        return {
          icon: Plus,
          title: 'No shopping lists yet',
          description: 'Create your first shopping list or generate one from your recipes',
          actionText: 'Create Shopping List',
        }
      case 'recipes':
      default:
        return {
          icon: Plus,
          title: 'No recipes yet',
          description: 'Start building your recipe collection by generating your first AI-powered recipe!',
          actionText: 'Generate Your First Recipe',
        }
    }
  }

  const defaults = getDefaultProps()
  const FinalIcon = Icon || defaults.icon
  const finalTitle = title || defaults.title
  const finalDescription = description || defaults.description
  const finalActionText = actionText || defaults.actionText

  return (
    <div className={`text-center py-12 bg-white rounded-lg border border-gray-200 ${className}`}>
      <FinalIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{finalTitle}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{finalDescription}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 mx-auto"
        >
          <FinalIcon className="h-4 w-4" />
          <span>{finalActionText}</span>
        </button>
      )}
    </div>
  )
}

export default EmptyState