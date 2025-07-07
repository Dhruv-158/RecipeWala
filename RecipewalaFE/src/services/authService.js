import api from './api'

export const authService = {
  async register(userData) {
    try {
      console.log('🔄 Registering user:', { ...userData, password: '[HIDDEN]' })
      
      const response = await api.post('/auth/register', userData)
      
      // Log the response structure for debugging
      console.log('✅ Register Response:', response.data)
      
      // Store token if provided
      if (response.data.accessToken || response.data.token) {
        const token = response.data.accessToken || response.data.token
        // Token will be automatically included in future requests via Redux persist
        console.log('✅ Token received and will be stored in Redux')
      }
      
      return response
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message)
      throw error
    }
  },

  async login(credentials) {
    try {
      console.log('🔄 Logging in user:', { ...credentials, password: '[HIDDEN]' })
      
      const response = await api.post('/auth/login', credentials)
      
      // Log the response structure for debugging
      console.log('✅ Login Response:', response.data)
      
      // Store token if provided
      if (response.data.accessToken || response.data.token) {
        const token = response.data.accessToken || response.data.token
        // Token will be automatically included in future requests via Redux persist
        console.log('✅ Token received and will be stored in Redux')
      }
      
      return response
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      throw error
    }
  },

  async logout() {
    try {
      console.log('🔄 Logging out user...')
      
      const response = await api.post('/auth/logout')
      
      console.log('✅ Logout successful')
      return response
    } catch (error) {
      // Even if logout fails on server, we still want to clear local state
      console.warn('⚠️ Server logout failed, clearing local state anyway:', error.message)
      throw error
    }
  },

  async getProfile() {
    try {
      console.log('🔄 Fetching user profile...')
      
      const response = await api.get('/auth/profile')
      
      console.log('✅ Profile fetched:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error.response?.data || error.message)
      throw error
    }
  },

  async updateProfile(userData) {
    try {
      console.log('🔄 Updating profile:', userData)
      
      const response = await api.put('/auth/profile', userData)
      
      console.log('✅ Profile updated:', response.data)
      return response
    } catch (error) {
      console.error('❌ Profile update failed:', error.response?.data || error.message)
      throw error
    }
  },

  async changePassword(passwordData) {
    try {
      console.log('🔄 Changing password...')
      
      const response = await api.put('/auth/change-password', passwordData)
      
      console.log('✅ Password changed successfully')
      return response
    } catch (error) {
      console.error('❌ Password change failed:', error.response?.data || error.message)
      throw error
    }
  },

  async refreshToken() {
    try {
      console.log('🔄 Refreshing token...')
      
      const response = await api.post('/auth/refresh-token')
      
      console.log('✅ Token refreshed')
      return response
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message)
      throw error
    }
  }
}