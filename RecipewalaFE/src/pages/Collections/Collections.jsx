import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Folder, 
  Calendar, 
  ShoppingCart,
  Grid,
  List,
  Search
} from 'lucide-react'
import EmptyState from '../../components/Common/EmptyState'

const Collections = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('collections')
  const [viewMode, setViewMode] = useState('grid')

  const tabs = [
    { id: 'collections', label: 'Collections', icon: Folder, count: 0 },
    { id: 'meal-plans', label: 'Meal Plans', icon: Calendar, count: 0 },
  ]

  return (
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
            onClick={() => alert('Create collection feature coming soon!')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Collection</span>
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
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <EmptyState
            type={activeTab}
            title={`No ${activeTab === 'collections' ? 'collections' : 'meal plans'} yet`}
            description={`Create your first ${activeTab === 'collections' ? 'recipe collection to organize your favorites' : 'meal plan to organize your weekly cooking'}`}
            actionText={`Create ${activeTab === 'collections' ? 'Collection' : 'Meal Plan'}`}
            onAction={() => alert(`${activeTab} feature coming soon!`)}
            icon={activeTab === 'collections' ? Folder : Calendar}
          />
        </div>
      </div>
    </div>
  )
}

export default Collections