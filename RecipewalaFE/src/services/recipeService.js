import api from './api'

export const recipeService = {
  async generateRecipe(data) {
    // Send the full form data to the backend
    return await api.post('/recipes/generate', data)
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

  async getRecipeStats() {
    // Fetch per-user stats from new backend endpoint
    return await api.get('/recipes/stats')
  }
}