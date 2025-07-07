import api from './api'

export const collectionService = {
  async getUserCollections(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/collections?${queryString}`)
  },

  async getCollectionById(id) {
    return await api.get(`/collections/${id}`)
  },

  async createCollection(collectionData) {
    return await api.post('/collections', collectionData)
  },

  async updateCollection(id, data) {
    return await api.put(`/collections/${id}`, data)
  },

  async deleteCollection(id) {
    return await api.delete(`/collections/${id}`)
  },

  async addRecipeToCollection(collectionId, recipeId) {
    return await api.post(`/collections/${collectionId}/recipes`, { recipeId })
  },

  async removeRecipeFromCollection(collectionId, recipeId) {
    return await api.delete(`/collections/${collectionId}/recipes/${recipeId}`)
  },

  async getPublicCollections(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/collections/public?${queryString}`)
  },

  async followCollection(id) {
    return await api.post(`/collections/${id}/follow`)
  },

  async unfollowCollection(id) {
    return await api.delete(`/collections/${id}/follow`)
  },

  async shareCollection(id) {
    return await api.post(`/collections/${id}/share`)
  },

  async duplicateCollection(id) {
    return await api.post(`/collections/${id}/duplicate`)
  }
}