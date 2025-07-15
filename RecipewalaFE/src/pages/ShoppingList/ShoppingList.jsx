import { useState, useEffect, useMemo } from 'react'
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Circle,
  Download,
  Share2
} from 'lucide-react'
import EmptyState from '../../components/Common/EmptyState'
import toast from 'react-hot-toast'

// Create Shopping List Modal
const CreateShoppingListModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Shopping list name is required')
      return
    }

    const newList = {
      name: name.trim(),
      description: description.trim(),
      items: [],
      createdAt: new Date().toISOString(),
      completedAt: null
    }

    onSave(newList)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Shopping List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Weekly Groceries, Party Shopping"
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
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Optional description..."
            />
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
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Item Modal
const AddItemModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('Produce')

  const categories = [
    'Produce',
    'Dairy & Eggs',
    'Bakery',
    'Pantry',
    'Frozen',
    'Beverages',
    'Snacks',
    'Health & Beauty',
    'Household',
    'Other'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Item name is required')
      return
    }

    onSave({
      id: Date.now(),
      name: name.trim(),
      quantity: quantity.trim() || '1',
      category,
      completed: false
    })

    setName('')
    setQuantity('')
    setCategory('Produce')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Bananas, Bread, Beans"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 2 lbs, 1 dozen, 3 pieces"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Shopping List Card
const ShoppingListCard = ({ list, onOpen, onEdit, onDelete, onToggleComplete }) => {
  const completedItems = list.items.filter(item => item.completed).length
  const totalItems = list.items.length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <h3 className="font-semibold text-gray-900 mb-2">{list.name}</h3>
          {list.description && (
            <p className="text-sm text-gray-600 mb-3">{list.description}</p>
          )}
          
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span className="font-medium">{totalItems} items</span>
              <span className="text-xs">{new Date(list.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-3">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{completedItems} of {totalItems} completed</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onOpen}
          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          View List
        </button>
        {list.completedAt ? (
          <button
            onClick={() => onToggleComplete(false)}
            className="px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
          >
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </button>
        ) : completedItems === totalItems && totalItems > 0 ? (
          <button
            onClick={() => onToggleComplete(true)}
            className="px-3 py-2 border border-green-500 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
          >
            Mark Complete
          </button>
        ) : null}
      </div>
    </div>
  )
}

// Shopping List Detail Modal
const ShoppingListDetailModal = ({ list, onClose, onUpdateList, onDeleteList }) => {
  const [items, setItems] = useState(list.items || [])
  const [showAddItem, setShowAddItem] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = ['all', 'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Health & Beauty', 'Household', 'Other']

  const toggleItemComplete = (itemId) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updatedItems)
    
    // Auto-save changes
    const updatedList = { ...list, items: updatedItems }
    onUpdateList(updatedList)
  }

  const removeItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId)
    setItems(updatedItems)
    
    const updatedList = { ...list, items: updatedItems }
    onUpdateList(updatedList)
    toast.success('Item removed')
  }

  const addItem = (newItem) => {
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    
    const updatedList = { ...list, items: updatedItems }
    onUpdateList(updatedList)
    setShowAddItem(false)
    toast.success('Item added')
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, filterCategory])

  const groupedItems = useMemo(() => {
    const grouped = filteredItems.reduce((acc, item) => {
      const category = item.category || 'Other'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {})

    // Sort categories and items
    const sortedCategories = Object.keys(grouped).sort()
    const result = {}
    sortedCategories.forEach(category => {
      result[category] = grouped[category].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return a.name.localeCompare(b.name)
      })
    })

    return result
  }, [filteredItems])

  const completedItems = items.filter(item => item.completed).length
  const totalItems = items.length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{list.name}</h2>
              {list.description && (
                <p className="text-gray-600 mt-1">{list.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                <span>{totalItems} items</span>
                <span>{completedItems} completed</span>
                <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {completedItems} of {totalItems}</span>
                <span>{Math.round((completedItems / totalItems) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedItems / totalItems) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
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
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddItem(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterCategory !== 'all' ? 'No items found' : 'No items yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Add some items to get started with your shopping list'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    {category} ({categoryItems.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          item.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => toggleItemComplete(item.id)}
                            className={`p-1 rounded-full transition-colors ${
                              item.completed
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          
                          <div className={`flex-1 ${item.completed ? 'opacity-60' : ''}`}>
                            <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            {item.quantity && (
                              <p className="text-sm text-gray-500">{item.quantity}</p>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <AddItemModal
            onClose={() => setShowAddItem(false)}
            onSave={addItem}
          />
        )}
      </div>
    </div>
  )
}

// Main Shopping List Component
const ShoppingList = () => {
  const [shoppingLists, setShoppingLists] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'completed'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedList, setSelectedList] = useState(null)
  const [showListDetail, setShowListDetail] = useState(false)

  useEffect(() => {
    loadShoppingLists()
  }, [])

  const loadShoppingLists = () => {
    try {
      const saved = localStorage.getItem('shoppingLists')
      if (saved) {
        setShoppingLists(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error)
    }
  }

  const saveShoppingLists = (lists) => {
    setShoppingLists(lists)
    localStorage.setItem('shoppingLists', JSON.stringify(lists))
  }

  const createShoppingList = (newList) => {
    const listWithId = { ...newList, id: Date.now().toString() }
    const updatedLists = [...shoppingLists, listWithId]
    saveShoppingLists(updatedLists)
    setShowCreateModal(false)
    toast.success('Shopping list created successfully!')
  }

  const updateShoppingList = (updatedList) => {
    const updatedLists = shoppingLists.map(list =>
      list.id === updatedList.id ? updatedList : list
    )
    saveShoppingLists(updatedLists)
  }

  const deleteShoppingList = (listId) => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      const updatedLists = shoppingLists.filter(list => list.id !== listId)
      saveShoppingLists(updatedLists)
      toast.success('Shopping list deleted successfully!')
    }
  }

  const toggleListComplete = (listId, completed) => {
    const updatedLists = shoppingLists.map(list =>
      list.id === listId 
        ? { ...list, completedAt: completed ? new Date().toISOString() : null }
        : list
    )
    saveShoppingLists(updatedLists)
    toast.success(completed ? 'Shopping list marked as completed!' : 'Shopping list marked as active!')
  }

  const filteredLists = useMemo(() => {
    return shoppingLists.filter(list => {
      const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           list.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'completed' && list.completedAt) ||
                           (filterStatus === 'active' && !list.completedAt)
      
      return matchesSearch && matchesStatus
    })
  }, [shoppingLists, searchTerm, filterStatus])

  return (
    <>
      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
            <p className="text-gray-600">Organize your grocery shopping</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New List</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shopping lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Lists</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredLists.length === 0 ? (
              <EmptyState
                type="shopping"
                title={searchTerm || filterStatus !== 'all' ? "No shopping lists found" : "No shopping lists yet"}
                description={searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first shopping list to get started"
                }
                actionText="Create Shopping List"
                onAction={() => setShowCreateModal(true)}
                icon={ShoppingCart}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLists.map(list => (
                  <ShoppingListCard
                    key={list.id}
                    list={list}
                    onOpen={() => {
                      setSelectedList(list)
                      setShowListDetail(true)
                    }}
                    onEdit={() => {
                      setSelectedList(list)
                      setShowListDetail(true)
                    }}
                    onDelete={() => deleteShoppingList(list.id)}
                    onToggleComplete={(completed) => toggleListComplete(list.id, completed)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateShoppingListModal
          onClose={() => setShowCreateModal(false)}
          onSave={createShoppingList}
        />
      )}

      {showListDetail && selectedList && (
        <ShoppingListDetailModal
          list={selectedList}
          onClose={() => {
            setShowListDetail(false)
            setSelectedList(null)
          }}
          onUpdateList={(updatedList) => {
            updateShoppingList(updatedList)
            setSelectedList(updatedList)
          }}
          onDeleteList={(listId) => {
            deleteShoppingList(listId)
            setShowListDetail(false)
            setSelectedList(null)
          }}
        />
      )}
    </>
  )
}

export default ShoppingList