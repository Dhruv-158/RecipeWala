import { useState } from 'react'
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  Search,
  Filter
} from 'lucide-react'
import EmptyState from '../../components/Common/EmptyState'

const ShoppingList = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
          <p className="text-gray-600">Organize your grocery shopping</p>
        </div>
        
        <button
          onClick={() => alert('Shopping list feature coming soon!')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New List</span>
        </button>
      </div>

      {/* Shopping List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <EmptyState
            type="shopping"
            title="No shopping lists yet"
            description="Create your first shopping list or generate one from your recipes"
            actionText="Create Shopping List"
            onAction={() => alert('Shopping list feature coming soon!')}
            icon={ShoppingCart}
          />
        </div>
      </div>
    </div>
  )
}

export default ShoppingList