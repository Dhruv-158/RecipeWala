// src/features/recipes/recipeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { recipeService } from '../../services/recipeService'

// Async thunks for API calls
export const generateRecipe = createAsyncThunk(
  'recipes/generate',
  async (recipeData, { rejectWithValue }) => {
    try {
      console.log('🚀 Generate recipe request data:', recipeData)
      const response = await recipeService.generateRecipe(recipeData)
      console.log('📥 Generate recipe API full response:', response)
      console.log('📦 Response data:', response.data)
      
      // Return the full response.data so we can handle it in the reducer
      return response.data
    } catch (error) {
      console.error('❌ Generate recipe error:', error)
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
      console.log('toggleFavorite response:', response)
      
      // Handle the nested response structure from your backend
      const recipeData = response.data?.data?.recipe || response.data?.recipe
      
      return { 
        recipeId: id,
        isFavorite: recipeData.isFavorite 
      }
    } catch (error) {
      console.log('toggleFavorite error:', error)
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

// Helper function to safely extract recipe from various response structures
const extractRecipeFromResponse = (responseData) => {
  console.log('🔍 extractRecipeFromResponse input:', responseData)
  
  if (!responseData) {
    console.log('❌ No response data provided')
    return null
  }

  // Try different possible paths where the recipe might be located
  const possiblePaths = [
    responseData.recipe,           // Direct recipe property
    responseData.data?.recipe,     // Nested under data
    responseData.data?.data?.recipe, // Double nested
    responseData.success?.recipe,  // Under success
    responseData.result?.recipe,   // Under result
    responseData                   // The response itself might be the recipe
  ]

  for (let i = 0; i < possiblePaths.length; i++) {
    const candidate = possiblePaths[i]
    console.log(`🔍 Trying path ${i}:`, candidate)
    
    if (candidate && (candidate._id || candidate.id || candidate.name)) {
      console.log('✅ Found recipe at path', i, ':', candidate)
      return candidate
    }
  }

  console.log('❌ No valid recipe found in any path')
  return null
}

// Helper function to normalize recipe data
const normalizeRecipe = (recipe) => {
  if (!recipe) {
    console.log('❌ normalizeRecipe: No recipe provided')
    return null
  }
  
  console.log('🔄 normalizeRecipe input:', recipe)
  
  const normalized = {
    ...recipe,
    id: recipe.id || recipe._id,
    _id: recipe._id || recipe.id,
    title: recipe.title || recipe.name,
    name: recipe.name || recipe.title,
    // Preserve all image-related fields
    imageUrl: recipe.imageUrl,
    thumbnailUrl: recipe.thumbnailUrl,
    imageGenerated: recipe.imageGenerated || false,
    imageAttribution: recipe.imageAttribution,
    imagePrompt: recipe.imagePrompt
  }
  
  console.log('✅ normalizeRecipe output:', normalized)
  return normalized
}

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentRecipe: (state, action) => {
      state.currentRecipe = normalizeRecipe(action.payload)
    },
    clearCurrentRecipe: (state) => {
      console.log('🧹 Clearing current recipe')
      state.currentRecipe = null
    },
    updateRecipeInList: (state, action) => {
      const recipeToUpdate = normalizeRecipe(action.payload)
      const recipeId = recipeToUpdate?.id || recipeToUpdate?._id
      
      const index = state.recipes.findIndex(recipe => 
        (recipe.id || recipe._id) === recipeId
      )
      
      if (index !== -1) {
        state.recipes[index] = {
          ...state.recipes[index],
          ...recipeToUpdate
        }
      }
    },
    removeRecipeFromList: (state, action) => {
      const recipeId = action.payload
      state.recipes = state.recipes.filter(recipe => 
        (recipe.id || recipe._id) !== recipeId
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate recipe
      .addCase(generateRecipe.pending, (state) => {
        console.log('⏳ Generate recipe pending')
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateRecipe.fulfilled, (state, action) => {
        console.log('✅ Generate recipe fulfilled')
        console.log('📦 Full payload:', action.payload)
        
        state.isGenerating = false
        
        // Extract recipe from the response
        const recipeData = extractRecipeFromResponse(action.payload)
        console.log('🎯 Extracted recipe data:', recipeData)
        
        // Normalize the recipe
        const recipe = normalizeRecipe(recipeData)
        console.log('🏗️ Normalized recipe:', recipe)
        
        if (recipe) {
          state.currentRecipe = recipe
          console.log('✅ Successfully set currentRecipe:', recipe)
        } else {
          console.log('❌ Failed to extract valid recipe data')
          state.error = 'Failed to process recipe data'
        }
      })
      .addCase(generateRecipe.rejected, (state, action) => {
        console.log('❌ Generate recipe rejected:', action.payload)
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
        
        // Handle the data structure from getUserRecipes
        const recipesData = action.payload.data?.recipes || action.payload.recipes || []
        const recipes = Array.isArray(recipesData)
          ? recipesData.map(recipe => normalizeRecipe(recipe))
          : []
          
        state.recipes = recipes
        state.pagination = action.payload.data?.pagination || action.payload.pagination || { current: 1, pages: 1, total: 0 }
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
        
        // Handle different response structures
        const recipeData = extractRecipeFromResponse(action.payload)
        const recipe = normalizeRecipe(recipeData)
        state.currentRecipe = recipe
      })
      .addCase(getRecipeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete recipe
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter(recipe => 
          (recipe.id || recipe._id) !== action.payload
        )
        if ((state.currentRecipe?.id || state.currentRecipe?._id) === action.payload) {
          state.currentRecipe = null
        }
        state.stats.totalRecipes = Math.max(0, state.stats.totalRecipes - 1)
      })
      
      // Save recipe
      .addCase(saveRecipe.fulfilled, (state, action) => {
        const recipeData = extractRecipeFromResponse(action.payload)
        const newRecipe = normalizeRecipe(recipeData)
        
        if (newRecipe) {
          const existingIndex = state.recipes.findIndex(recipe => 
            (recipe.id || recipe._id) === (newRecipe.id || newRecipe._id)
          )
          
          if (existingIndex !== -1) {
            state.recipes[existingIndex] = newRecipe
          } else {
            state.recipes.unshift(newRecipe)
            state.stats.totalRecipes += 1
          }
        }
      })
      
      // Update recipe
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const recipeData = extractRecipeFromResponse(action.payload)
        const updatedRecipe = normalizeRecipe(recipeData)
        
        if (updatedRecipe) {
          const index = state.recipes.findIndex(recipe => 
            (recipe.id || recipe._id) === (updatedRecipe.id || updatedRecipe._id)
          )
          
          if (index !== -1) {
            state.recipes[index] = updatedRecipe
          }
          
          if ((state.currentRecipe?.id || state.currentRecipe?._id) === (updatedRecipe.id || updatedRecipe._id)) {
            state.currentRecipe = updatedRecipe
          }
        }
      })
      
      // Toggle favorite - FIXED VERSION
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        console.log('Toggle favorite fulfilled with payload:', action.payload)
        
        const { recipeId, isFavorite } = action.payload
        
        // Update recipe in the recipes array - ONLY update the isFavorite field
        const index = state.recipes.findIndex(recipe => 
          (recipe.id || recipe._id) === recipeId
        )
        
        if (index !== -1) {
          // Preserve all existing data, only update isFavorite
          state.recipes[index] = {
            ...state.recipes[index],
            isFavorite: isFavorite
          }
          console.log('Updated recipe in list:', state.recipes[index])
        } else {
          console.warn('Recipe not found in list for ID:', recipeId)
        }
        
        // Update current recipe if it's the same one - ONLY update the isFavorite field
        if ((state.currentRecipe?.id || state.currentRecipe?._id) === recipeId) {
          state.currentRecipe = {
            ...state.currentRecipe,
            isFavorite: isFavorite
          }
        }
        
        // Update stats
        if (isFavorite) {
          state.stats.favorites += 1
        } else {
          state.stats.favorites = Math.max(0, state.stats.favorites - 1)
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        console.error('Toggle favorite rejected:', action.payload)
        state.error = action.payload
      })
      
      // Get recipe stats
      .addCase(getRecipeStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats || action.payload.data?.stats
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