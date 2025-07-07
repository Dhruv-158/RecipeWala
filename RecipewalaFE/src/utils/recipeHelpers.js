export const formatCookTime = (time) => {
  if (!time) return '30 mins'
  if (typeof time === 'number') {
    if (time < 60) return `${time} mins`
    const hours = Math.floor(time / 60)
    const mins = time % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return time
}

export const formatServings = (servings) => {
  if (!servings) return '4 servings'
  return `${servings} ${servings === 1 ? 'serving' : 'servings'}`
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'text-green-600 bg-green-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'hard': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export const scaleIngredients = (ingredients, originalServings, newServings) => {
  if (!ingredients || !originalServings || !newServings) return ingredients
  
  const ratio = newServings / originalServings
  
  return ingredients.map(ingredient => {
    // Enhanced ingredient scaling with better number detection
    const fractionPattern = /(\d+\/\d+)/g
    const decimalPattern = /(\d+\.?\d*)/g
    
    let scaledIngredient = ingredient
    
    // Handle fractions first
    const fractions = ingredient.match(fractionPattern)
    if (fractions) {
      fractions.forEach(fraction => {
        const [num, denom] = fraction.split('/').map(Number)
        const decimal = num / denom
        const scaledDecimal = decimal * ratio
        const scaledFraction = decimalToFraction(scaledDecimal)
        scaledIngredient = scaledIngredient.replace(fraction, scaledFraction)
      })
    }
    
    // Handle regular numbers
    const numbers = scaledIngredient.match(decimalPattern)
    if (numbers) {
      numbers.forEach(num => {
        const scaledNum = (parseFloat(num) * ratio)
        const formattedNum = formatScaledNumber(scaledNum)
        scaledIngredient = scaledIngredient.replace(num, formattedNum)
      })
    }
    
    return scaledIngredient
  })
}

const decimalToFraction = (decimal) => {
  if (decimal >= 1) {
    const whole = Math.floor(decimal)
    const remainder = decimal - whole
    if (remainder < 0.1) return whole.toString()
    const fraction = decimalToFraction(remainder)
    return `${whole} ${fraction}`
  }
  
  const tolerance = 1.0e-6
  let numerator = 1
  let denominator = 1
  
  while (Math.abs(decimal - numerator / denominator) > tolerance) {
    if (decimal > numerator / denominator) {
      numerator++
    } else {
      denominator++
      numerator = Math.round(decimal * denominator)
    }
    
    if (denominator > 100) break // Prevent infinite loops
  }
  
  return `${numerator}/${denominator}`
}

const formatScaledNumber = (num) => {
  if (num === Math.floor(num)) {
    return num.toString()
  }
  
  // Round to 2 decimal places and remove trailing zeros
  return parseFloat(num.toFixed(2)).toString()
}

export const generateRecipeSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

export const estimateReadingTime = (instructions) => {
  if (!instructions || !Array.isArray(instructions)) return 0
  
  const wordsPerMinute = 200
  const totalWords = instructions.join(' ').split(' ').length
  return Math.ceil(totalWords / wordsPerMinute)
}

export const categorizeRecipe = (title, ingredients = [], tags = []) => {
  const categories = {
    'breakfast': ['egg', 'toast', 'pancake', 'cereal', 'oatmeal', 'breakfast'],
    'lunch': ['sandwich', 'salad', 'soup', 'wrap', 'lunch'],
    'dinner': ['chicken', 'beef', 'pork', 'fish', 'pasta', 'rice', 'dinner'],
    'dessert': ['cake', 'cookie', 'ice cream', 'chocolate', 'sweet', 'dessert'],
    'appetizer': ['dip', 'chip', 'appetizer', 'starter', 'snack'],
    'beverage': ['drink', 'juice', 'smoothie', 'coffee', 'tea', 'beverage']
  }
  
  const searchText = `${title} ${ingredients.join(' ')} ${tags.join(' ')}`.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category
    }
  }
  
  return 'main-course'
}

export const validateRecipeData = (recipe) => {
  const errors = {}
  
  if (!recipe.title?.trim()) {
    errors.title = 'Recipe title is required'
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.ingredients = 'At least one ingredient is required'
  }
  
  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.instructions = 'At least one instruction step is required'
  }
  
  if (recipe.servings && (recipe.servings < 1 || recipe.servings > 50)) {
    errors.servings = 'Servings must be between 1 and 50'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}