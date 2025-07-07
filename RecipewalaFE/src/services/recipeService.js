import api from './api'

export const recipeService = {
  async generateRecipe(recipeName) {
    return await api.post('/recipes/generate', { recipeName })
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
  }
}