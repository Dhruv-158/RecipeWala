// COMPLETE: src/features/recipes/recipeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Fallback recipe service if the real one isn't available
const fallbackRecipeService = {
  generateRecipe: async (recipeData) => ({
    data: {
      recipe: {
        id: Date.now().toString(),
        title: recipeData.recipeName || 'Sample Recipe',
        description: 'A delicious AI-generated recipe',
        ingredients: ['Sample ingredient 1', 'Sample ingredient 2'],
        instructions: ['Step 1: Prepare ingredients', 'Step 2: Cook and enjoy'],
        cookTime: '30 minutes',
        servings: 4,
        difficulty: 'medium'
      }
    }
  }),
  getUserRecipes: async (params) => ({
    data: {
      recipes: [],
      pagination: { current: 1, pages: 1, total: 0 }
    }
  }),
  getRecipeById: async (id) => ({
    data: {
      recipe: {
        id,
        title: 'Sample Recipe',
        description: 'A sample recipe',
        ingredients: ['Sample ingredient'],
        instructions: ['Sample instruction'],
        cookTime: '30 minutes',
        servings: 4,
        difficulty: 'medium'
      }
    }
  }),
  deleteRecipe: async (id) => ({ success: true }),
  saveRecipe: async (recipeData) => ({
    data: {
      recipe: { ...recipeData, id: Date.now().toString() }
    }
  }),
  updateRecipe: async (id, data) => ({
    data: {
      recipe: { ...data, id }
    }
  }),
  toggleFavorite: async (id) => ({
    data: {
      recipe: { id, isFavorite: true }
    }
  }),
  getRecipeStats: async () => ({
    data: {
      stats: {
        totalRecipes: 0,
        generatedToday: 0,
        favorites: 0,
        thisWeek: 0,
        totalCookTime: '0h',
        avgRating: 0
      }
    }
  })
}

import { recipeService } from '../../services/recipeService'

// Async thunks for API calls
export const generateRecipe = createAsyncThunk(
  'recipes/generate',
  async (recipeData, { rejectWithValue }) => {
    try {
      const response = await recipeService.generateRecipe(recipeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate recipe')
    }
  }
)

export const fetchUserRecipes = createAsyncThunk(
  'recipes/fetchUserRecipes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await recipeService.getUserRecipes(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipes')
    }
  }
)

export const getRecipeById = createAsyncThunk(
  'recipes/getRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.getRecipeById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipe')
    }
  }
)

export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue }) => {
    try {
      await recipeService.deleteRecipe(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete recipe')
    }
  }
)

export const saveRecipe = createAsyncThunk(
  'recipes/saveRecipe',
  async (recipeData, { rejectWithValue }) => {
    try {
      const response = await recipeService.saveRecipe(recipeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save recipe')
    }
  }
)

export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await recipeService.updateRecipe(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update recipe')
    }
  }
)

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.toggleFavorite(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update favorite')
    }
  }
)

export const getRecipeStats = createAsyncThunk(
  'recipes/getRecipeStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recipeService.getRecipeStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

const initialState = {
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  stats: {
    totalRecipes: 0,
    generatedToday: 0,
    favorites: 0,
    thisWeek: 0,
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
}

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentRecipe: (state, action) => {
      state.currentRecipe = action.payload
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null
    },
    updateRecipeInList: (state, action) => {
      const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id)
      if (index !== -1) {
        state.recipes[index] = action.payload
      }
    },
    removeRecipeFromList: (state, action) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate recipe
      .addCase(generateRecipe.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateRecipe.fulfilled, (state, action) => {
        state.isGenerating = false
        // Normalize recipe object to always have id and title
        let recipe = action.payload.recipe
        if (recipe) {
          recipe = {
            ...recipe,
            id: recipe.id || recipe._id,
            title: recipe.title || recipe.name
          }
        }
        state.currentRecipe = recipe
      })
      .addCase(generateRecipe.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload
      })
      
      // Fetch recipes
      .addCase(fetchUserRecipes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.isLoading = false
        // Use the correct path for recipes and pagination
        const recipes = Array.isArray(action.payload.data?.recipes)
          ? action.payload.data.recipes.map(recipe => ({
              ...recipe,
              id: recipe.id || recipe._id,
              title: recipe.title || recipe.name
            }))
          : []
        state.recipes = recipes
        state.pagination = action.payload.data?.pagination || { current: 1, pages: 1, total: 0 }
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get recipe by ID
      .addCase(getRecipeById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRecipeById.fulfilled, (state, action) => {
        state.isLoading = false
        // Normalize the recipe object to always have id and title
        let recipe = action.payload?.recipe || action.payload?.data?.recipe
        if (recipe) {
          recipe = {
            ...recipe,
            id: recipe.id || recipe._id,
            title: recipe.title || recipe.name
          }
          state.currentRecipe = recipe
        } else {
          state.currentRecipe = null
        }
      })
      .addCase(getRecipeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete recipe
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload)
        if (state.currentRecipe?.id === action.payload) {
          state.currentRecipe = null
        }
        state.stats.totalRecipes = Math.max(0, state.stats.totalRecipes - 1)
      })
      
      // Save recipe
      .addCase(saveRecipe.fulfilled, (state, action) => {
        const existingIndex = state.recipes.findIndex(recipe => recipe.id === action.payload.recipe.id)
        if (existingIndex !== -1) {
          state.recipes[existingIndex] = action.payload.recipe
        } else {
          state.recipes.unshift(action.payload.recipe)
          state.stats.totalRecipes += 1
        }
      })
      
      // Update recipe
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.recipes.findIndex(recipe => recipe.id === action.payload.recipe.id)
        if (index !== -1) {
          state.recipes[index] = action.payload.recipe
        }
        if (state.currentRecipe?.id === action.payload.recipe.id) {
          state.currentRecipe = action.payload.recipe
        }
      })
      
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.recipes.findIndex(recipe => recipe.id === action.payload.recipe.id)
        if (index !== -1) {
          state.recipes[index] = action.payload.recipe
        }
        if (state.currentRecipe?.id === action.payload.recipe.id) {
          state.currentRecipe = action.payload.recipe
        }
        if (action.payload.recipe.isFavorite) {
          state.stats.favorites += 1
        } else {
          state.stats.favorites = Math.max(0, state.stats.favorites - 1)
        }
      })
      
      // Get recipe stats
      .addCase(getRecipeStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats
      })
  },
})

export const { 
  clearError, 
  setCurrentRecipe, 
  clearCurrentRecipe, 
  updateRecipeInList, 
  removeRecipeFromList 
} = recipeSlice.actions

export default recipeSlice.reducer