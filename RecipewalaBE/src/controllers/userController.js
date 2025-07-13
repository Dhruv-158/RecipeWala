// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }
        responseHandler.success(res, { user }, 'Profile fetched successfully');
    } catch (error) {
        logger.error('Get profile error:', error);
        responseHandler.error(res, 'Failed to fetch profile', 500);
    }
};
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const logger = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');

const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user._id;
        let updateFields = {};

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return responseHandler.error(res, 'Username already taken', 400);
            }
            updateFields.username = username;
        }

        // Handle image upload
        if (req.file && req.file.filename) {
            // Save relative path or URL (should match static route)
            updateFields.image = `/uploads/${req.file.filename}`;
        }


        // If no fields to update, return error
        if (Object.keys(updateFields).length === 0) {
            return responseHandler.error(res, 'No data to update', 400);
        }

        await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true }
        );
        // Always fetch the latest user (with all fields)
        const updatedUser = await User.findById(userId);

        logger.info(`User profile updated: ${updatedUser.email}`);

        responseHandler.success(res, {
            user: updatedUser
        }, 'Profile updated successfully');

    } catch (error) {
        logger.error('Update profile error:', error);
        responseHandler.error(res, 'Failed to update profile', 500);
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [totalRecipes, recentRecipes] = await Promise.all([
            Recipe.countDocuments({ user: userId }),
            Recipe.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name createdAt difficulty')
        ]);

        const stats = {
            totalRecipes,
            recentRecipes,
            memberSince: req.user.createdAt
        };

        responseHandler.success(res, {
            stats
        }, 'Dashboard stats retrieved successfully');

    } catch (error) {
        logger.error('Get dashboard stats error:', error);
        responseHandler.error(res, 'Failed to retrieve dashboard stats', 500);
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return responseHandler.error(res, 'Current password is incorrect', 400);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        logger.info(`Password changed for user: ${user.email}`);

        responseHandler.success(res, null, 'Password changed successfully');

    } catch (error) {
        logger.error('Change password error:', error);
        responseHandler.error(res, 'Failed to change password', 500);
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return responseHandler.error(res, 'Password is incorrect', 400);
        }

        // Delete all user's recipes
        await Recipe.deleteMany({ user: userId });

        // Delete user account
        await User.findByIdAndDelete(userId);

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        logger.info(`Account deleted for user: ${user.email}`);

        responseHandler.success(res, null, 'Account deleted successfully');

    } catch (error) {
        logger.error('Delete account error:', error);
        responseHandler.error(res, 'Failed to delete account', 500);
    }
};

module.exports = {
    updateProfile,
    getProfile,
    getDashboardStats,
    changePassword,
    deleteAccount
};
