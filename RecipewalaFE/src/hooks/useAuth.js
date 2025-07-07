import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, clearError } from '../features/auth/authSlice'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const auth = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutUser = async () => {
    try {
      await authService.logout()
      dispatch(logout())
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      // Clear local state even if server logout fails
      dispatch(logout())
      navigate('/login')
      toast.error('Logout completed with errors')
    }
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    ...auth,
    logout: logoutUser,
    clearError: clearAuthError,
  }
}