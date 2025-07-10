import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  TrendingUp, 
  Clock, 
  ChefHat, 
  Heart, 
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Award
} from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import LoadingSpinner from '../Common/LoadingSpinner'

const CookingInsights = ({ className = '' }) => {
  const { user } = useSelector((state) => state.auth)
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true)
        const response = await analyticsService.getCookingInsights(timeRange)
        setInsights(response.data.insights)
      } catch (error) {
        console.error('Failed to fetch insights:', error)
        // Set default insights if API fails
        setInsights({
          recipesCreated: 0,
          avgCookTime: 30,
          favoritesAdded: 0,
          cookingStreak: 0,
          topCuisines: [],
          weeklyProgress: 0,
          weeklyGoal: 5,
          healthyRecipePercentage: 0,
          recentAchievements: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <p className="text-gray-500 text-center">No insights available yet</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Cooking Insights</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 3 months</option>
          <option value="1year">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InsightCard
          icon={ChefHat}
          title="Recipes Created"
          value={insights.recipesCreated || 0}
          change={insights.recipesCreatedChange}
          color="bg-blue-500"
        />
        
        <InsightCard
          icon={Clock}
          title="Avg Cook Time"
          value={`${insights.avgCookTime || 30}min`}
          change={insights.avgCookTimeChange}
          color="bg-green-500"
        />
        
        <InsightCard
          icon={Heart}
          title="Favorites Added"
          value={insights.favoritesAdded || 0}
          change={insights.favoritesAddedChange}
          color="bg-red-500"
        />
        
        <InsightCard
          icon={Target}
          title="Cooking Streak"
          value={`${insights.cookingStreak || 0} days`}
          change={insights.cookingStreakChange}
          color="bg-purple-500"
        />
      </div>

      {/* Cuisine Preferences */}
      {insights.topCuisines && insights.topCuisines.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Favorite Cuisines</h4>
          <div className="space-y-2">
            {insights.topCuisines.map((cuisine, index) => (
              <div key={cuisine.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{cuisine.name}</span>
                  <span className="text-xs text-gray-500">({cuisine.count} recipes)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${cuisine.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{cuisine.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cooking Goals */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Cooking Goals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Weekly Recipe Goal</span>
              </div>
              {insights.weeklyGoalAchieved && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Goals Achieved</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((insights.weeklyProgress || 0) / (insights.weeklyGoal || 5)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-blue-600">
                {insights.weeklyProgress || 0}/{insights.weeklyGoal || 5}
              </span>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-800">Healthy Recipes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${insights.healthyRecipePercentage || 0}%` }}
                />
              </div>
              <span className="text-xs text-green-600">
                {insights.healthyRecipePercentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {insights.recentAchievements && insights.recentAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            {insights.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{achievement.title}</p>
                  <p className="text-xs text-yellow-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const InsightCard = ({ icon: Icon, title, value, change, color }) => {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-xs ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            <TrendingUp className={`h-3 w-3 ${isNegative ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default CookingInsights