import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
})

// Helper to get token from Redux persist storage
const getStoredToken = () => {
  try {
    const persistedState = localStorage.getItem('persist:recipewala-root')
    if (persistedState) {
      const parsed = JSON.parse(persistedState)
      const authState = JSON.parse(parsed.auth)
      return authState.accessToken
    }
  } catch (error) {
    console.error('Error getting stored token:', error)
  }
  return null
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token found and set in Authorization header:', token)
    } else {
      console.warn('⚠️ No token found in localStorage for API request!')
    }
    // Log the request for debugging
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      // Show a toast, but do NOT clear auth state or log out user automatically
      toast.error('Session expired or unauthorized. Please log in again if needed.')
      // Optionally, you can redirect to login here, but do not clear state
    }
    return Promise.reject(error)
  }
)

export default api