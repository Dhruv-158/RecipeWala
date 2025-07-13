import api from './api'

export const recipeService = {
  async generateRecipe(data) {
    const response = await api.post('/recipes/generate', data)
    // DEBUG: Log the full response structure
    console.log('🔍 recipeService.generateRecipe response:', response)
    console.log('🔍 response.data:', response.data)
    console.log('🔍 response.data.recipe:', response.data?.recipe)
    console.log('🔍 response.data.data:', response.data?.data)
    console.log('🔍 response.data.data.recipe:', response.data?.data?.recipe)
    return response
  },

  async getUserRecipes(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/recipes?${queryString}`)
  },

  async getRecipeById(id) {
    return await api.get(`/recipes/${id}`)
  },

  async deleteRecipe(id) {
    return await api.delete(`/recipes/${id}`)
  },

  async updateRecipe(id, data) {
    return await api.put(`/recipes/${id}`, data)
  },

  async toggleFavorite(id) {
    return await api.patch(`/recipes/${id}/favorite`)
  },

  async saveRecipe(recipeData) {
    return await api.post('/recipes', recipeData)
  },

  async generateRecipeImage(id) {
    return await api.post(`/recipes/${id}/generate-image`)
  },

  async getRecipeStats() {
    return await api.get('/recipes/stats')
  }
}