// ENHANCED UPDATE: src/pages/Auth/Register.jsx - Apply new styling classes
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { registerUser, clearError } from '../../features/auth/authSlice'
import toast from 'react-hot-toast'

// Validation schema  
const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
})

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur'
  })

  const password = watch('password')

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Navigate after successful registration
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎉 Registration successful, navigating to dashboard')
      navigate('/dashboard', { replace: true })
      toast.success('Account created successfully!')
    }
  }, [isAuthenticated, navigate])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const onSubmit = async (data) => {
    try {
      dispatch(clearError())
      const result = await dispatch(registerUser(data)).unwrap()
      if (result.user && result.accessToken) {
        reset()
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration failed:', err)
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300'
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2 kitchen-subtitle">Welcome To,</h1>
        <h2 className="text-3xl font-bold kitchen-title mb-4">
          RecipeWala
        </h2>
        <div className="kitchen-divider w-24"></div>
        <h3 className="text-2xl font-semibold kitchen-label mb-2">Sign Up</h3>
      </div>
      
      {error && (
        <div className="mb-6 p-4 kitchen-error rounded-xl text-sm flex items-center space-x-2 slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        {/* Username Field */}
        <div className="kitchen-focus">
          <label htmlFor="username" className="block text-lg font-medium kitchen-label mb-2">
            Username
          </label>
          <div className="relative">
            <input
              {...register('username')}
              type="text"
              id="username"
              className={`kitchen-input w-full px-4 py-3 text-gray-700 ${
                errors.username ? 'border-red-400' : ''
              }`}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.username.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="kitchen-focus">
          <label htmlFor="email" className="block text-lg font-medium kitchen-label mb-2">
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
              placeholder="XYZ@gmail.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="kitchen-focus">
          <label htmlFor="password" className="block text-lg font-medium kitchen-label mb-2">
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
              placeholder="Create a password"
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
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-3 slide-up">
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`password-strength-bar rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm kitchen-label font-medium">{passwordStrength.label}</span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="kitchen-focus">
          <label htmlFor="confirmPassword" className="block text-lg font-medium kitchen-label mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className={`kitchen-input w-full px-4 py-3 text-gray-700 pr-12 ${
                errors.confirmPassword ? 'border-red-400' : ''
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 slide-up">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="kitchen-button col-span-2 w-full text-white py-3 px-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin kitchen-spinner" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Sign Up</span>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center col-span-2">
          <p className="kitchen-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="kitchen-link font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register