// src/controllers/analyticsController.js
// Simple mock analytics controller for insights endpoint

const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.getInsights = async (req, res) => {
  try {
    const { timeRange } = req.query;
    // Parse timeRange (e.g., '30days')
    let dateFilter = {};
    if (timeRange && timeRange.endsWith('days')) {
      const days = parseInt(timeRange.replace('days', ''));
      if (!isNaN(days)) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        dateFilter = { createdAt: { $gte: fromDate } };
      }
    }


    // Per-user filter
    const userId = req.user?._id;
    const userFilter = { user: userId };
    const userDateFilter = { ...dateFilter, user: userId };

    // Total recipes for this user
    const totalRecipes = await Recipe.countDocuments(userFilter);
    // Recipes generated in time range for this user
    const recipesGenerated = await Recipe.countDocuments(userDateFilter);

    // Most popular recipe (by name, most created) for this user
    const mostPopular = await Recipe.aggregate([
      { $match: userFilter },
      { $group: { _id: '$name', count: { $sum: 1 }, lastCooked: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Top cuisines (by count) for this user
    const topCuisines = await Recipe.aggregate([
      { $match: userFilter },
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Active users (for this user, always 1)
    const activeUsers = [userId];

    // Most active user (for this user, always self)
    const mostActiveUser = req.user ? { username: req.user.username, recipesCreated: totalRecipes } : null;

    // Recent recipes for this user
    const recentRecipes = await Recipe.find(userFilter, 'name createdAt').sort({ createdAt: -1 }).limit(3);

    // --- FAVORITES & ADVANCED STATS ---
    // Assumes Recipe model has a 'favorites' array of user ObjectIds
    // Total number of times recipes have been favorited

    // Favorites for this user (recipes this user has favorited)
    const favoritesAgg = await Recipe.aggregate([
      { $match: userFilter },
      { $project: { favoritesCount: { $size: { $ifNull: ['$favorites', []] } } } },
      { $group: { _id: null, totalFavorites: { $sum: '$favoritesCount' } } }
    ]);
    const recipesFavorited = favoritesAgg.length > 0 ? favoritesAgg[0].totalFavorites : 0;

    // Most favorited recipe for this user
    const mostFavoritedRecipeAgg = await Recipe.aggregate([
      { $match: userFilter },
      { $project: { name: 1, favoritesCount: { $size: { $ifNull: ['$favorites', []] } } } },
      { $sort: { favoritesCount: -1 } },
      { $limit: 1 }
    ]);
    const mostFavoritedRecipe = mostFavoritedRecipeAgg.length > 0 ? {
      name: mostFavoritedRecipeAgg[0].name,
      favoritesCount: mostFavoritedRecipeAgg[0].favoritesCount
    } : null;

    // User with most favorites (for this user, always self)
    const userWithMostFavorites = req.user ? { username: req.user.username, totalFavorites: recipesFavorited } : null;

    // --- Additional stats for dashboard and insights ---

    // Recipes generated today (for this user)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recipesGeneratedToday = await Recipe.countDocuments({ user: userId, createdAt: { $gte: today } });

    // Recipes generated this week (for this user)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (dayOfWeek + 6) % 7; // days since last Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const recipesGeneratedThisWeek = await Recipe.countDocuments({ user: userId, createdAt: { $gte: monday } });


    // Cooking Insights: Recipes Created (all time and this week)
    const recipesCreated = totalRecipes;
    const recipesCreatedThisWeek = recipesGeneratedThisWeek;

    // Avg Cook Time (for this user, if Recipe has a cookTime field in minutes)
    let avgCookTime = null;
    const cookTimeAgg = await Recipe.aggregate([
      { $match: { ...userFilter, cookTime: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$cookTime' } } }
    ]);
    if (cookTimeAgg.length > 0) avgCookTime = Math.round(cookTimeAgg[0].avg);


    // Favorites Added (all time and this week) for this user
    const favoritesAddedThisWeekAgg = await Recipe.aggregate([
      { $match: userFilter },
      { $project: { favorites: 1, createdAt: 1 } },
      { $unwind: { path: '$favorites', preserveNullAndEmptyArrays: true } },
      { $match: { favorites: { $ne: null }, createdAt: { $gte: monday } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const favoritesAddedThisWeek = favoritesAddedThisWeekAgg.length > 0 ? favoritesAddedThisWeekAgg[0].count : 0;


    // Cooking Streak: Longest streak of days with at least one recipe created (for this user)
    const streakAgg = await Recipe.aggregate([
      { $match: userFilter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    let longestStreak = 0, currentStreak = 0, prevDate = null;
    for (const day of streakAgg) {
      const date = new Date(day._id);
      if (prevDate) {
        const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      prevDate = date;
    }

    // Cooking Goals: Use real data for weekly goal progress
    // Weekly goal: 5 recipes per week (can be made dynamic per user if needed)
    const weeklyGoal = 5;
    // Cap weekly progress at weeklyGoal
    const weeklyProgress = Math.min(recipesGeneratedThisWeek, weeklyGoal);
    // Add a flag for goal achievement
    const weeklyGoalAchieved = recipesGeneratedThisWeek >= weeklyGoal;

    // Healthy Recipes: % of user's recipes marked as healthy
    // Assume a boolean field 'isHealthy' on Recipe. If not present, treat as not healthy.
    const totalUserRecipes = await Recipe.countDocuments(userFilter);
    let healthyRecipePercentage = 0;
    if (totalUserRecipes > 0) {
      const healthyCount = await Recipe.countDocuments({ ...userFilter, isHealthy: true });
      healthyRecipePercentage = Math.round((healthyCount / totalUserRecipes) * 100);
    }

    // Compose insights
    const insights = {
      // Dashboard cards
      totalRecipes,
      recipesGeneratedToday,
      recipesFavorited,
      recipesGeneratedThisWeek,

      // Cooking Insights
      recipesCreated,
      recipesCreatedThisWeek,
      avgCookTime,
      favoritesAdded: recipesFavorited,
      favoritesAddedThisWeek,
      cookingStreak: longestStreak,
      weeklyGoal,
      weeklyProgress,
      weeklyGoalAchieved,
      healthyRecipePercentage,

      // Existing advanced stats
      mostPopularRecipe: mostPopular.length > 0 ? {
        name: mostPopular[0]._id,
        timesCooked: mostPopular[0].count,
        lastCooked: mostPopular[0].lastCooked,
      } : null,
      mostFavoritedRecipe,
      userWithMostFavorites,
      favoriteCuisine: topCuisines.length > 0 ? topCuisines[0]._id : null,
      topCuisines: topCuisines.map(c => ({ name: c._id, count: c.count })),
      activeUsers: activeUsers.length,
      mostActiveUser,
      recentRecipes: recentRecipes.map(r => ({ name: r.name, createdAt: r.createdAt })),
      timeRange: timeRange || '30days',
    };
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err.message });
  }
};
