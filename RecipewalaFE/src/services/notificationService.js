import api from './api'

export const notificationService = {
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/notifications?${queryString}`)
  },

  async getUnreadCount() {
    return await api.get('/notifications/unread-count')
  },

  async markAsRead(notificationId) {
    return await api.patch(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead() {
    return await api.patch('/notifications/mark-all-read')
  },

  async deleteNotification(notificationId) {
    return await api.delete(`/notifications/${notificationId}`)
  },

  async getNotificationSettings() {
    return await api.get('/notifications/settings')
  },

  async updateNotificationSettings(settings) {
    return await api.put('/notifications/settings', settings)
  },

  async subscribeToWebPush(subscription) {
    return await api.post('/notifications/web-push/subscribe', subscription)
  },

  async unsubscribeFromWebPush() {
    return await api.delete('/notifications/web-push/unsubscribe')
  },

  async testNotification(type) {
    return await api.post('/notifications/test', { type })
  }
}