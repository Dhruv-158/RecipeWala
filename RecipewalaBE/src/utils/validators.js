const mongoose = require('mongoose');

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 20;
};

const isValidPassword = (password) => {
    // At least 6 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
};

const validateRecipeName = (name) => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, message: 'Recipe name is required' };
    }
    
    const sanitized = sanitizeInput(name);
    if (sanitized.length < 2 || sanitized.length > 100) {
        return { isValid: false, message: 'Recipe name must be between 2 and 100 characters' };
    }
    
    return { isValid: true, sanitized };
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    isValidUsername,
    isValidPassword,
    sanitizeInput,
    validateRecipeName
};
