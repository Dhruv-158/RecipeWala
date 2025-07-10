// ENHANCED UPDATE: src/pages/Auth/Login.jsx - Apply new styling classes
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { loginUser, clearError } from '../../features/auth/authSlice'
import toast from 'react-hot-toast'

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)
  
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur'
  })

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Navigate after successful login
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎉 Login successful, navigating to:', from)
      navigate(from, { replace: true })
      toast.success('Welcome back!')
    }
  }, [isAuthenticated, navigate, from])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const onSubmit = async (data) => {
    try {
      dispatch(clearError());
      const result = await dispatch(loginUser(data)).unwrap();
      if (result.user && result.accessToken) {
        reset();
        toast.success('Login successful!');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(err.message || 'Invalid credentials. Please try again.');
    }
  }

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2 kitchen-subtitle">Welcome To,</h1>
        <h2 className="text-3xl font-bold kitchen-title mb-4">
          RecipeWala
        </h2>
        <div className="kitchen-divider w-24"></div>
        <h3 className="text-2xl font-semibold kitchen-label mb-2">Login</h3>
      </div>
      
      {error && (
        <div className="mb-6 p-4 kitchen-error rounded-xl text-sm flex items-center space-x-2 slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="kitchen-focus">
          <label htmlFor="email" className="block text-lg font-medium kitchen-label mb-3">
            Email
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`kitchen-input w-full px-4 py-3 text-gray-700 ${
                errors.email ? 'border-red-400' : ''
              }`}
              placeholder="xyz@gmail.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="kitchen-focus">
          <label htmlFor="password" className="block text-lg font-medium kitchen-label mb-3">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`kitchen-input w-full px-4 py-3 text-gray-700 pr-12 ${
                errors.password ? 'border-red-400' : ''
              }`}
              placeholder="Password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="kitchen-button w-full text-white py-3 px-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin kitchen-spinner" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="kitchen-subtitle">
            Don't have an account ?{' '}
            <Link to="/register" className="kitchen-link font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login