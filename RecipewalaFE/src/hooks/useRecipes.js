import { useSelector, useDispatch } from 'react-redux'
import { 
  generateRecipe, 
  fetchUserRecipes, 
  deleteRecipe, 
  saveRecipe,
  toggleFavorite,
  getRecipeStats,
  clearError 
} from '../features/recipes/recipeSlice'
import { recipeService } from '../services/recipeService'
import toast from 'react-hot-toast'

export const useRecipes = () => {
  const dispatch = useDispatch()
  const recipes = useSelector((state) => state.recipes)

  const generateNewRecipe = async (recipeData) => {
    try {
      const result = await dispatch(generateRecipe(recipeData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const fetchRecipes = async (params = {}) => {
    try {
      const result = await dispatch(fetchUserRecipes(params)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const removeRecipe = async (id) => {
    try {
      await dispatch(deleteRecipe(id)).unwrap()
      toast.success('Recipe deleted successfully')
    } catch (error) {
      toast.error('Failed to delete recipe')
      throw error
    }
  }

  const saveCurrentRecipe = async (recipeData) => {
    try {
      const result = await dispatch(saveRecipe(recipeData)).unwrap()
      toast.success('Recipe saved successfully')
      return result
    } catch (error) {
      toast.error('Failed to save recipe')
      throw error
    }
  }

  const toggleRecipeFavorite = async (id) => {
    try {
      const result = await dispatch(toggleFavorite(id)).unwrap()
      const message = result.recipe.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      toast.success(message)
      return result
    } catch (error) {
      toast.error('Failed to update favorite')
      throw error
    }
  }

  const getStats = async () => {
    try {
      const result = await dispatch(getRecipeStats()).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const clearRecipeError = () => {
    dispatch(clearError())
  }

  return {
    ...recipes,
    generateNewRecipe,
    fetchRecipes,
    removeRecipe,
    saveCurrentRecipe,
    toggleRecipeFavorite,
    getStats,
    clearRecipeError,
  }
}