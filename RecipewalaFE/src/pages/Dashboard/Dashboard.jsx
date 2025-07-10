import { ChefHat, Plus, BookOpen, TrendingUp, Clock, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { getRecipeStats, fetchUserRecipes } from '../../features/recipes/recipeSlice'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import CookingInsights from '../../components/Analytics/CookingInsights'
import logoImg from '../../assets/images/logo.png'

const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  // Defensive fallback for stats and recipes
  const { stats = {}, recipes = [], isLoading, error } = useSelector((state) => state.recipes)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for dynamic greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch stats and recent recipes on component mount
  useEffect(() => {
    dispatch(getRecipeStats())
    dispatch(fetchUserRecipes({ 
      limit: 6, 
      sort: 'newest' 
    }))
  }, [dispatch])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }


  // Use username if available, otherwise fallback to first name or 'Chef'
  const getDisplayName = (user) => {
    if (!user) return 'Chef';
    if (user.username) return user.username;
    if (user.name) return user.name.split(' ')[0];
    return 'Chef';
  }

  // Use real stats from backend (from Redux slice)
  const statCards = [
    {
      title: 'Total Recipes',
      value: stats.totalRecipes?.toString() || '0',
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: stats.totalRecipesTrend || '',
    },
    {
      title: 'Generated Today',
      value: stats.generatedToday?.toString() || '0',
      icon: Plus,
      color: 'bg-green-500',
      trend: stats.generatedTodayTrend || '',
    },
    {
      title: 'Favorites',
      value: stats.favorites?.toString() || '0',
      icon: Heart,
      color: 'bg-red-500',
      trend: stats.favoritesTrend || '',
    },
    {
      title: 'This Week',
      value: stats.thisWeek?.toString() || '0',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: stats.thisWeekTrend || '',
    },
  ]

  const recentRecipes = Array.isArray(recipes) ? recipes.slice(0, 3) : []

  // Error state for recipes
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => dispatch(fetchUserRecipes({ limit: 6, sort: 'newest' }))}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {getDisplayName(user)}! 👨‍🍳
        </h1>
        <p className="text-orange-100 mb-4">Ready to create something delicious today?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/generate')}
            className="bg-white text-orange-500 px-6 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Recipe</span>
          </button>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Browse Recipes</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              {isLoading && stat.title === 'Total Recipes' ? (
                <LoadingSpinner size="small" />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Recipes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Recipes</h2>
            <button
              onClick={() => navigate('/recipes')}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm"
            >
              View All
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : recentRecipes.length > 0 ? (
            <div className="space-y-3">
              {recentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <img src={logoImg} alt="Logo" className="h-10 w-10 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{recipe.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.cookTime || '30 mins'}</span>
                      </div>
                      <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
                    </div>
                  </div>
                  {recipe.isFavorite && (
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recipes yet. Generate your first recipe!</p>
              <button
                onClick={() => navigate('/generate')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Generate Recipe</p>
                <p className="text-sm text-orange-100">Create with AI assistance</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/recipes?filter=favorites')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">View Favorites</p>
                <p className="text-sm text-red-100">Your saved recipes</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/collections')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Collections</p>
                <p className="text-sm text-blue-100">Organize your recipes</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Cooking Insights */}
      <CookingInsights />

      {/* Cooking Tips */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">💡 Today's Cooking Tip</h2>
        <p className="text-green-100">
          {getTodaysTip()}
        </p>
      </div>
    </div>
  )
}

// Helper function for daily cooking tips
const getTodaysTip = () => {
  const tips = [
    "Always taste your food as you cook - seasoning is key to great flavors!",
    "Let your meat rest for 5-10 minutes after cooking for juicier results.",
    "Keep your knives sharp - it's safer and makes prep work much easier.",
    "Don't overcrowd your pan when searing - it leads to steaming instead of browning.",
    "Read the entire recipe before you start cooking to avoid surprises.",
    "Mise en place - prepare all ingredients before you start cooking.",
    "Salt your pasta water generously - it should taste like seawater.",
    "Room temperature ingredients mix better and cook more evenly.",
    "Use a thermometer for perfect doneness - guessing leads to overcooking.",
    "Fresh herbs should be added at the end to preserve their flavor and color."
  ];
  // Use the current date string as a seed for randomness, so it changes every day
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  let hash = 0;
  for (let i = 0; i < seed.toString().length; i++) {
    hash = (hash << 5) - hash + seed.toString().charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % tips.length;
  return tips[idx];
}

export default Dashboard