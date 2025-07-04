# RecipeWala - AI-Powered Recipe Generator

A modern full-stack application that generates personalized recipes using AI, allows users to save and manage their favorite recipes, and provides a comprehensive recipe management system.

## Features

### 🤖 AI-Powered Recipe Generation
- Generate recipes using Google's Gemini AI
- Input ingredients you have and get recipe suggestions
- Customize by cuisine, difficulty level, and cooking time
- Get nutritional information and cooking tips

### 👤 User Management
- Secure user registration and authentication
- JWT-based authentication with cookie support
- User profiles with preferences and dietary restrictions
- Password security with bcrypt encryption

### 📝 Recipe Management
- Create, read, update, and delete recipes
- Search and filter recipes by various criteria
- Public and private recipe sharing
- Recipe rating and review system
- Advanced search with pagination

### 🔒 Security Features
- Helmet.js for HTTP header security
- Rate limiting to prevent abuse
- Input validation and sanitization
- MongoDB injection protection
- CORS configuration for frontend integration

### 📊 Monitoring & Logging
- Winston logging system
- Error tracking and handling
- Performance monitoring
- Request/response logging

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Jest & Supertest** - Testing
- **Google Generative AI** - Recipe generation

### Security & Validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **express-mongo-sanitize** - NoSQL injection prevention
- **cookie-parser** - Cookie handling

## Project Structure

```
RecipewalaBE/
├── controllers/          # Route controllers
│   ├── authController.js
│   └── recipeController.js
├── middlewares/          # Custom middleware
│   ├── authMiddleware.js
│   └── validation.js
├── models/              # Database models
│   ├── User.js
│   └── Recipe.js
├── routes/              # API routes
│   ├── authRoutes.js
│   └── recipeRoutes.js
├── services/            # Business logic
│   └── llmService.js
├── utils/               # Utilities
│   ├── errorHandler.js
│   └── logger.js
├── tests/               # Test files
│   ├── auth.test.js
│   ├── recipe.test.js
│   └── setup.js
├── scripts/             # Utility scripts
│   └── seedData.js
├── logs/                # Log files
├── config/              # Configuration
│   └── db.js
├── app.js               # Express app setup
├── server.js            # Server entry point
└── package.json         # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google Generative AI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RecipeWala/RecipewalaBE
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipewala
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB
Make sure MongoDB is running locally or provide a cloud connection string.

### 5. Seed the Database (Optional)
```bash
npm run seed
```

### 6. Start the Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-password` - Update password

### Recipes
- `POST /api/recipes/generate` - Generate recipe with AI
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes` - Get user's recipes (with filtering/search)
- `GET /api/recipes/public` - Get public recipes
- `GET /api/recipes/:id` - Get single recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The project includes comprehensive tests for:
- Authentication endpoints
- Recipe CRUD operations
- Middleware validation
- Error handling
- Security features

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Generate Recipe
```bash
curl -X POST http://localhost:5000/api/recipes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "ingredients": ["chicken", "tomatoes", "onions"],
    "cuisine": "Italian",
    "difficulty": "Medium",
    "cookingTime": 30
  }'
```

### Create Recipe
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Favorite Pasta",
    "ingredients": ["pasta", "tomato sauce", "cheese"],
    "instructions": ["Boil pasta", "Add sauce", "Serve hot"],
    "cookingTime": 15,
    "servings": 2,
    "difficulty": "Easy"
  }'
```

## Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Protected routes with middleware
- Cookie-based authentication support

### Input Validation
- Request validation using express-validator
- Custom validation rules for complex data
- Sanitization to prevent XSS attacks
- MongoDB injection prevention

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting per IP
- Request size limiting

### Error Handling
- Custom error classes
- Centralized error handling
- Detailed logging without exposing sensitive data
- Different error responses for development/production

## Logging

The application uses Winston for comprehensive logging:
- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Development mode only

Log levels: error, warn, info, debug

## Performance Considerations

### Database Optimization
- Indexed fields for better query performance
- Pagination for large datasets
- Aggregation pipelines for complex queries
- Connection pooling

### Caching Strategy
- JWT tokens cached in cookies
- Static middleware for file serving
- Mongoose query optimization

### Monitoring
- Request/response logging
- Error tracking
- Performance metrics
- Health check endpoints

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure secure MongoDB connection
4. Set up proper logging
5. Configure reverse proxy (nginx)

### Security Checklist
- [ ] Strong JWT secrets
- [ ] Secure MongoDB credentials
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Security headers set
- [ ] Error handling configured
- [ ] Logging enabled

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
