import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for backend calls
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if your backend uses them
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

// Response interceptor - handle errors and success
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    })
    return response
  },
  async (error) => {
    const { response, config } = error

    // Log errors for debugging
    console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
      message: error.message
    })

    if (response) {
      const { status, data } = response

      // Handle specific error cases
      switch (status) {
        case 400:
          // Bad request - usually validation errors
          if (data?.errors) {
            // Handle validation errors from backend
            if (Array.isArray(data.errors)) {
              data.errors.forEach(err => toast.error(err.message || err))
            } else if (typeof data.errors === 'object') {
              Object.values(data.errors).forEach(err => {
                toast.error(Array.isArray(err) ? err[0] : err)
              })
            }
          } else {
            toast.error(data?.message || 'Invalid request')
          }
          break
          
        case 401:
          // Unauthorized - token expired or invalid
          const currentPath = window.location.pathname
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            toast.error('Session expired. Please login again.')
            
            // Clear stored auth data
            try {
              const persistedState = localStorage.getItem('persist:recipewala-root')
              if (persistedState) {
                const parsed = JSON.parse(persistedState)
                parsed.auth = JSON.stringify({
                  user: null,
                  accessToken: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: null,
                })
                localStorage.setItem('persist:recipewala-root', JSON.stringify(parsed))
              }
            } catch (e) {
              console.error('Error clearing auth data:', e)
            }
            
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          }
          break
          
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.')
          break
          
        case 404:
          toast.error('Resource not found')
          break
          
        case 409:
          // Conflict - usually duplicate data
          toast.error(data?.message || 'Conflict: Resource already exists')
          break
          
        case 422:
          // Unprocessable entity - validation errors
          if (data?.errors) {
            if (Array.isArray(data.errors)) {
              data.errors.forEach(err => toast.error(err.message || err))
            } else if (typeof data.errors === 'object') {
              Object.values(data.errors).forEach(err => {
                toast.error(Array.isArray(err) ? err[0] : err)
              })
            }
          } else {
            toast.error(data?.message || 'Validation failed')
          }
          break
          
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
          
        case 500:
          toast.error('Server error. Please try again later.')
          break
          
        case 502:
          toast.error('Server temporarily unavailable')
          break
          
        case 503:
          toast.error('Service temporarily unavailable')
          break
          
        default:
          toast.error(data?.message || `Error: ${status}`)
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection and backend server.')
    } else {
      toast.error('An unexpected error occurred. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api