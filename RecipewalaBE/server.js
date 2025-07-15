const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
require('dotenv').config();
const path = require('path');

// Import routes
const authRoutes = require('./src/routes/auth');
const recipeRoutes = require('./src/routes/recipes');
const recipeStatsRoutes = require('./src/routes/recipeStats');
const userRoutes = require('./src/routes/users');
const analyticsRoutes = require('./src/routes/analytics');
const notificationRoutes = require('./src/routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow CORS for static uploads and serve from src/uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for images
  // Do NOT set Access-Control-Allow-Credentials for public images
  next();
}, express.static(path.join(__dirname, 'src', 'uploads')));

// Routes

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Recipewala API',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/recipes/stats', recipeStatsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Handle undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
