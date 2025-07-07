import api from './api'

export const socialService = {
  async generateShareLink(recipeId, privacy = 'public') {
    return await api.post('/social/share-link', { recipeId, privacy })
  },

  async shareRecipe(recipeId, platform, options = {}) {
    return await api.post('/social/share-recipe', { recipeId, platform, options })
  },

  async likeRecipe(recipeId) {
    return await api.post(`/social/recipes/${recipeId}/like`)
  },

  async unlikeRecipe(recipeId) {
    return await api.delete(`/social/recipes/${recipeId}/like`)
  },

  async commentOnRecipe(recipeId, comment) {
    return await api.post(`/social/recipes/${recipeId}/comments`, { comment })
  },

  async getRecipeComments(recipeId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/social/recipes/${recipeId}/comments?${queryString}`)
  },

  async followUser(userId) {
    return await api.post(`/social/users/${userId}/follow`)
  },

  async unfollowUser(userId) {
    return await api.delete(`/social/users/${userId}/follow`)
  },

  async getFollowers(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/social/users/${userId}/followers?${queryString}`)
  },

  async getFollowing(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/social/users/${userId}/following?${queryString}`)
  },

  async getFeed(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/social/feed?${queryString}`)
  },

  async getPopularRecipes(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/social/popular-recipes?${queryString}`)
  },

  async getTrendingCuisines() {
    return await api.get('/social/trending-cuisines')
  },

  async reportContent(contentType, contentId, reason) {
    return await api.post('/social/report', { contentType, contentId, reason })
  }
}