import { useState } from 'react'
import { collectionService } from '../services/collectionService'
import toast from 'react-hot-toast'

export const useCollections = () => {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCollections = async (params = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await collectionService.getUserCollections(params)
      setCollections(response.data.collections)
      return response.data
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch collections')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createCollection = async (collectionData) => {
    try {
      const response = await collectionService.createCollection(collectionData)
      setCollections(prev => [response.data.collection, ...prev])
      toast.success('Collection created successfully!')
      return response.data.collection
    } catch (err) {
      toast.error('Failed to create collection')
      throw err
    }
  }

  const updateCollection = async (id, data) => {
    try {
      const response = await collectionService.updateCollection(id, data)
      setCollections(prev => 
        prev.map(collection => 
          collection.id === id ? response.data.collection : collection
        )
      )
      toast.success('Collection updated successfully!')
      return response.data.collection
    } catch (err) {
      toast.error('Failed to update collection')
      throw err
    }
  }

  const deleteCollection = async (id) => {
    try {
      await collectionService.deleteCollection(id)
      setCollections(prev => prev.filter(collection => collection.id !== id))
      toast.success('Collection deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete collection')
      throw err
    }
  }

  const addRecipeToCollection = async (collectionId, recipeId) => {
    try {
      const response = await collectionService.addRecipeToCollection(collectionId, recipeId)
      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId ? response.data.collection : collection
        )
      )
      toast.success('Recipe added to collection!')
      return response.data.collection
    } catch (err) {
      toast.error('Failed to add recipe to collection')
      throw err
    }
  }

  const removeRecipeFromCollection = async (collectionId, recipeId) => {
    try {
      const response = await collectionService.removeRecipeFromCollection(collectionId, recipeId)
      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId ? response.data.collection : collection
        )
      )
      toast.success('Recipe removed from collection!')
      return response.data.collection
    } catch (err) {
      toast.error('Failed to remove recipe from collection')
      throw err
    }
  }

  return {
    collections,
    isLoading,
    error,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection,
  }
}