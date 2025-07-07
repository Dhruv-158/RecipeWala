import api from './api'

export const shoppingListService = {
  async getUserShoppingLists(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/shopping-lists?${queryString}`)
  },

  async getShoppingListById(id) {
    return await api.get(`/shopping-lists/${id}`)
  },

  async createShoppingList(listData) {
    return await api.post('/shopping-lists', listData)
  },

  async updateShoppingList(id, data) {
    return await api.put(`/shopping-lists/${id}`, data)
  },

  async deleteShoppingList(id) {
    return await api.delete(`/shopping-lists/${id}`)
  },

  async addItemToList(listId, itemData) {
    return await api.post(`/shopping-lists/${listId}/items`, itemData)
  },

  async updateItem(listId, itemId, itemData) {
    return await api.put(`/shopping-lists/${listId}/items/${itemId}`, itemData)
  },

  async removeItemFromList(listId, itemId) {
    return await api.delete(`/shopping-lists/${listId}/items/${itemId}`)
  },

  async toggleItem(listId, itemId) {
    return await api.patch(`/shopping-lists/${listId}/items/${itemId}/toggle`)
  },

  async generateFromRecipes(recipeIds) {
    return await api.post('/shopping-lists/generate/recipes', { recipeIds })
  },

  async generateFromCollection(collectionId) {
    return await api.post('/shopping-lists/generate/collection', { collectionId })
  },

  async generateFromMealPlan(mealPlanId) {
    return await api.post('/shopping-lists/generate/meal-plan', { mealPlanId })
  },

  async shareShoppingList(id) {
    return await api.post(`/shopping-lists/${id}/share`)
  },

  async exportShoppingList(id, format = 'txt') {
    return await api.get(`/shopping-lists/${id}/export?format=${format}`, {
      responseType: 'blob'
    })
  }
}