import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { setCredentials, logout } from '../../features/auth/authSlice'
import { authService } from '../../services/authService'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, accessToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()
  const [isInitializing, setIsInitializing] = useState(true)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we have a token but no auth state, verify with backend
        if (accessToken && !isAuthenticated) {
          const response = await authService.getProfile()
          dispatch(setCredentials({
            user: response.data.user,
            accessToken: accessToken
          }))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Token is invalid, clear it
        dispatch(logout())
      } finally {
        setIsInitializing(false)
      }
    }

    checkAuth()
  }, [accessToken, isAuthenticated, dispatch])

  // Show loading spinner while checking auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute