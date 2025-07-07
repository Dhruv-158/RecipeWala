import * as yup from 'yup'

// Common validation schemas
export const emailSchema = yup
  .string()
  .required('Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(6, 'Password must be at least 6 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

export const nameSchema = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

// Recipe validation schemas
export const recipeNameSchema = yup
  .string()
  .required('Recipe name is required')
  .min(3, 'Recipe name must be at least 3 characters')
  .max(100, 'Recipe name must be less than 100 characters')

// Helper functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }
  
  const score = Object.values(checks).filter(Boolean).length
  return { checks, score, isValid: score >= 4 }
}

export const getPasswordStrength = (password) => {
  const { score } = validatePassword(password)
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  
  return {
    score,
    label: labels[score - 1] || '',
    color: colors[score - 1] || 'bg-gray-300'
  }
}