import api from './api'

export const analyticsService = {
  async getCookingInsights(timeRange = '30days') {
    return await api.get(`/analytics/insights?timeRange=${timeRange}`)
  },

  async getRecipeAnalytics(recipeId) {
    return await api.get(`/analytics/recipes/${recipeId}`)
  },

  async getUserStats() {
    return await api.get('/analytics/user-stats')
  },

  async getCuisinePreferences() {
    return await api.get('/analytics/cuisine-preferences')
  },

  async getCookingPatterns() {
    return await api.get('/analytics/cooking-patterns')
  },

  async getGoalProgress() {
    return await api.get('/analytics/goal-progress')
  },

  async updateCookingGoals(goals) {
    return await api.put('/analytics/goals', goals)
  },

  async trackRecipeView(recipeId) {
    return await api.post(`/analytics/track/recipe-view`, { recipeId })
  },

  async trackRecipeGeneration(recipeData) {
    return await api.post('/analytics/track/recipe-generation', recipeData)
  },

  async trackCookingSession(sessionData) {
    return await api.post('/analytics/track/cooking-session', sessionData)
  }
}