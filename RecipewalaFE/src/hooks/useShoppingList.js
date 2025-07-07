import { useState } from 'react'
import { shoppingListService } from '../services/shoppingListService'
import toast from 'react-hot-toast'

export const useShoppingList = () => {
  const [shoppingLists, setShoppingLists] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchShoppingLists = async (params = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await shoppingListService.getUserShoppingLists(params)
      setShoppingLists(response.data.shoppingLists)
      return response.data
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch shopping lists')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createShoppingList = async (listData) => {
    try {
      const response = await shoppingListService.createShoppingList(listData)
      setShoppingLists(prev => [response.data.shoppingList, ...prev])
      toast.success('Shopping list created successfully!')
      return response.data.shoppingList
    } catch (err) {
      toast.error('Failed to create shopping list')
      throw err
    }
  }

  const generateFromRecipes = async (recipeIds) => {
    try {
      setIsLoading(true)
      const response = await shoppingListService.generateFromRecipes(recipeIds)
      setShoppingLists(prev => [response.data.shoppingList, ...prev])
      toast.success('Shopping list generated from recipes!')
      return response.data.shoppingList
    } catch (err) {
      toast.error('Failed to generate shopping list')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const addItemToList = async (listId, itemData) => {
    try {
      const response = await shoppingListService.addItemToList(listId, itemData)
      setShoppingLists(prev => 
        prev.map(list => 
          list.id === listId ? response.data.shoppingList : list
        )
      )
      return response.data.shoppingList
    } catch (err) {
      toast.error('Failed to add item')
      throw err
    }
  }

  const toggleItem = async (listId, itemId) => {
    try {
      const response = await shoppingListService.toggleItem(listId, itemId)
      setShoppingLists(prev => 
        prev.map(list => 
          list.id === listId ? response.data.shoppingList : list
        )
      )
      return response.data.shoppingList
    } catch (err) {
      toast.error('Failed to update item')
      throw err
    }
  }

  const removeItemFromList = async (listId, itemId) => {
    try {
      const response = await shoppingListService.removeItemFromList(listId, itemId)
      setShoppingLists(prev => 
        prev.map(list => 
          list.id === listId ? response.data.shoppingList : list
        )
      )
      return response.data.shoppingList
    } catch (err) {
      toast.error('Failed to remove item')
      throw err
    }
  }

  const deleteShoppingList = async (id) => {
    try {
      await shoppingListService.deleteShoppingList(id)
      setShoppingLists(prev => prev.filter(list => list.id !== id))
      toast.success('Shopping list deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete shopping list')
      throw err
    }
  }

  return {
    shoppingLists,
    isLoading,
    error,
    fetchShoppingLists,
    createShoppingList,
    generateFromRecipes,
    addItemToList,
    toggleItem,
    removeItemFromList,
    deleteShoppingList,
  }
}