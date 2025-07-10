const Recipe = require('../models/Recipe');

// Get per-user recipe stats for dashboard
exports.getUserRecipeStats = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Total recipes
    const totalRecipes = await Recipe.countDocuments({ user: userId });

    // Recipes generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const generatedToday = await Recipe.countDocuments({ user: userId, createdAt: { $gte: today } });

    // Recipes generated this week (from last Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const thisWeek = await Recipe.countDocuments({ user: userId, createdAt: { $gte: monday } });

    // Favorites: count of recipes this user has favorited (if you have a favorites array on user)
    // Or, count of this user's recipes that have been favorited by anyone (if you have a favorites array on Recipe)
    let favorites = 0;
    if (Recipe.schema.paths.favorites) {
      // Count how many times this user's recipes have been favorited
      const favAgg = await Recipe.aggregate([
        { $match: { user: userId } },
        { $project: { favoritesCount: { $size: { $ifNull: ['$favorites', []] } } } },
        { $group: { _id: null, total: { $sum: '$favoritesCount' } } }
      ]);
      favorites = favAgg.length > 0 ? favAgg[0].total : 0;
    }

    res.json({
      success: true,
      stats: {
        totalRecipes,
        generatedToday,
        thisWeek,
        favorites
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: err.message });
  }
};
