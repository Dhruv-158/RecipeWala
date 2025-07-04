const User = require('../models/User');
const authService = require('../services/authService');
const logger = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return responseHandler.error(res, 'Email already registered', 400);
            }
            if (existingUser.username === username) {
                return responseHandler.error(res, 'Username already taken', 400);
            }
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = authService.generateTokens(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info(`User registered successfully: ${user.email}`);

        responseHandler.success(res, {
            user: user.toJSON(),
            accessToken
        }, 'User registered successfully', 201);

    } catch (error) {
        logger.error('Registration error:', error);
        responseHandler.error(res, 'Registration failed', 500);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password +refreshToken');

        if (!user || !user.isActive) {
            return responseHandler.error(res, 'Invalid credentials', 401);
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return responseHandler.error(res, 'Invalid credentials', 401);
        }

        // Generate tokens
        const { accessToken, refreshToken } = authService.generateTokens(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info(`User logged in successfully: ${user.email}`);

        responseHandler.success(res, {
            user: user.toJSON(),
            accessToken
        }, 'Login successful');

    } catch (error) {
        logger.error('Login error:', error);
        responseHandler.error(res, 'Login failed', 500);
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user._id;

        // Clear refresh token from database
        await User.findByIdAndUpdate(userId, { 
            $unset: { refreshToken: 1 } 
        });

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        logger.info(`User logged out: ${req.user.email}`);

        responseHandler.success(res, null, 'Logout successful');

    } catch (error) {
        logger.error('Logout error:', error);
        responseHandler.error(res, 'Logout failed', 500);
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return responseHandler.error(res, 'Refresh token not provided', 401);
        }

        const decoded = authService.verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken || !user.isActive) {
            return responseHandler.error(res, 'Invalid refresh token', 401);
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user._id);

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        responseHandler.success(res, {
            accessToken
        }, 'Token refreshed successfully');

    } catch (error) {
        logger.error('Token refresh error:', error);
        responseHandler.error(res, 'Token refresh failed', 401);
    }
};

const getProfile = async (req, res) => {
    try {
        responseHandler.success(res, {
            user: req.user
        }, 'Profile retrieved successfully');
    } catch (error) {
        logger.error('Get profile error:', error);
        responseHandler.error(res, 'Failed to get profile', 500);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getProfile
};
