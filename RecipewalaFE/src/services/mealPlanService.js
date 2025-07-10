import api from './api'

export const mealPlanService = {
  async getUserMealPlans(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/meal-plans?${queryString}`)
  },

  async getMealPlanById(id) {
    return await api.get(`/meal-plans/${id}`)
  },

  async createMealPlan(mealPlanData) {
    return await api.post('/meal-plans', mealPlanData)
  },

  async updateMealPlan(id, data) {
    return await api.put(`/meal-plans/${id}`, data)
  },

  async deleteMealPlan(id) {
    return await api.delete(`/meal-plans/${id}`)
  },

  async addMealToPlan(planId, mealData) {
    return await api.post(`/meal-plans/${planId}/meals`, mealData)
  },

  async updateMeal(planId, mealId, mealData) {
    return await api.put(`/meal-plans/${planId}/meals/${mealId}`, mealData)
  },

  async removeMealFromPlan(planId, mealId) {
    return await api.delete(`/meal-plans/${planId}/meals/${mealId}`)
  },

  async generateMealPlan(preferences) {
    return await api.post('/meal-plans/generate', preferences)
  },

  async duplicateMealPlan(id) {
    return await api.post(`/meal-plans/${id}/duplicate`)
  },

  async shareMealPlan(id) {
    return await api.post(`/meal-plans/${id}/share`)
  },

  async exportMealPlan(id, format = 'pdf') {
    return await api.get(`/meal-plans/${id}/export?format=${format}`, {
      responseType: 'blob'
    })
  }
}