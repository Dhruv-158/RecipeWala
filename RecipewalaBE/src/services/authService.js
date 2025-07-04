const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthService {
    generateTokens(userId) {
        try {
            const accessToken = jwt.sign(
                { userId },
                process.env.JWT_SECRET,
                { 
                    expiresIn: process.env.JWT_EXPIRE || '15m',
                    issuer: 'recipe-generator-api',
                    audience: 'recipe-generator-client'
                }
            );

            const refreshToken = jwt.sign(
                { userId },
                process.env.JWT_REFRESH_SECRET,
                { 
                    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
                    issuer: 'recipe-generator-api',
                    audience: 'recipe-generator-client'
                }
            );

            return { accessToken, refreshToken };
        } catch (error) {
            logger.error('Token generation error:', error);
            throw new Error('Failed to generate tokens');
        }
    }

    verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET, {
                issuer: 'recipe-generator-api',
                audience: 'recipe-generator-client'
            });
        } catch (error) {
            throw error;
        }
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
                issuer: 'recipe-generator-api',
                audience: 'recipe-generator-client'
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService();
