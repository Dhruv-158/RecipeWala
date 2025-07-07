import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUser, clearError } from '../../features/auth/authSlice'
import { useEffect } from 'react'
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
      dispatch(clearError())
      await dispatch(loginUser(data)).unwrap()
      reset()
    } catch (err) {
      // Error handled by Redux and useEffect above
      console.error('Login failed:', err)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login