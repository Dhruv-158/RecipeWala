# Recipe Wala API - Postman Testing Guide

## Base URL
```
http://localhost:5000
```

## 📋 Complete API Routes for Postman Testing

### 🏠 **Root Endpoint**

#### Welcome Message
- **Method**: `GET`
- **URL**: `http://localhost:5000/`
- **Headers**: None required
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Welcome to Recipewala API",
    "timestamp": "2025-07-04T10:30:00.000Z"
}
```

---

### 🔐 **Authentication Routes** (`/api/auth`)

#### 1. Register User
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "_id": "user_id_here",
            "username": "johndoe",
            "email": "john@example.com",
            "isActive": true,
            "createdAt": "2025-07-04T10:30:00.000Z"
        },
        "accessToken": "jwt_token_here"
    }
}
```

#### 2. Login User
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
```json
{
    "email": "john@example.com",
    "password": "Password123"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "_id": "user_id_here",
            "username": "johndoe",
            "email": "john@example.com",
            "isActive": true,
            "lastLogin": "2025-07-04T10:30:00.000Z"
        },
        "accessToken": "jwt_token_here"
    }
}
```

#### 3. Get User Profile
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/profile`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
        "user": {
            "_id": "user_id_here",
            "username": "johndoe",
            "email": "john@example.com",
            "isActive": true,
            "createdAt": "2025-07-04T10:30:00.000Z"
        }
    }
}
```

#### 4. Refresh Token
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/refresh-token`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**: None (uses HTTP-only cookie)
- **Expected Response**:
```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "accessToken": "new_jwt_token_here"
    }
}
```

#### 5. Logout
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/logout`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Logout successful",
    "data": null
}
```

---

### 🍳 **Recipe Routes** (`/api/recipes`)

#### 1. Generate Recipe (AI)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/recipes/generate`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
    "recipeName": "Chicken Biryani"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "Recipe generated successfully",
    "data": {
        "recipe": {
            "_id": "recipe_id_here",
            "name": "Chicken Biryani",
            "description": "A flavorful and aromatic rice dish...",
            "prepTime": "30 minutes",
            "cookTime": "45 minutes",
            "servings": "4-6",
            "difficulty": "Medium",
            "ingredients": [
                {
                    "item": "Basmati Rice",
                    "amount": "2",
                    "unit": "cups"
                },
                {
                    "item": "Chicken",
                    "amount": "500",
                    "unit": "grams"
                }
            ],
            "instructions": [
                {
                    "step": 1,
                    "instruction": "Wash and soak the basmati rice for 30 minutes..."
                }
            ],
            "tips": ["Use aged basmati rice for best results"],
            "nutrition": {
                "calories": "450 per serving",
                "protein": "25g",
                "carbs": "55g",
                "fat": "12g"
            },
            "user": "user_id_here",
            "originalPrompt": "Chicken Biryani",
            "createdAt": "2025-07-04T10:30:00.000Z"
        }
    }
}
```

#### 2. Get User Recipes (Paginated)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/recipes?page=1&limit=10`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Expected Response**:
```json
{
    "success": true,
    "message": "Recipes retrieved successfully",
    "data": {
        "recipes": [
            {
                "_id": "recipe_id_1",
                "name": "Chicken Biryani",
                "description": "A flavorful rice dish...",
                "difficulty": "Medium",
                "prepTime": "30 minutes",
                "cookTime": "45 minutes",
                "servings": "4-6",
                "createdAt": "2025-07-04T10:30:00.000Z"
            }
        ],
        "pagination": {
            "current": 1,
            "pages": 1,
            "total": 1
        }
    }
}
```

#### 3. Get Recipe by ID
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/recipes/RECIPE_ID_HERE`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Expected Response**: (Same as generate recipe response)

#### 4. Search Recipes
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/recipes/search?query=chicken`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Query Parameters**:
  - `query` (required): Search term (minimum 2 characters)
- **Expected Response**:
```json
{
    "success": true,
    "message": "Search completed successfully",
    "data": {
        "recipes": [
            {
                "_id": "recipe_id_1",
                "name": "Chicken Biryani",
                "description": "A flavorful rice dish...",
                "difficulty": "Medium",
                "prepTime": "30 minutes",
                "cookTime": "45 minutes",
                "servings": "4-6",
                "createdAt": "2025-07-04T10:30:00.000Z"
            }
        ],
        "query": "chicken"
    }
}
```

#### 5. Delete Recipe
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/recipes/RECIPE_ID_HERE`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Recipe deleted successfully",
    "data": null
}
```

---

### 👤 **User Routes** (`/api/users`)

#### 1. Update Profile
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/users/profile`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
    "username": "johnsmith"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "user": {
            "_id": "user_id_here",
            "username": "johnsmith",
            "email": "john@example.com",
            "isActive": true,
            "updatedAt": "2025-07-04T10:30:00.000Z"
        }
    }
}
```

#### 2. Get Dashboard Stats
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/users/dashboard-stats`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Dashboard stats retrieved successfully",
    "data": {
        "stats": {
            "totalRecipes": 5,
            "recentRecipes": [
                {
                    "_id": "recipe_id_1",
                    "name": "Chicken Biryani",
                    "createdAt": "2025-07-04T10:30:00.000Z",
                    "difficulty": "Medium"
                }
            ],
            "memberSince": "2025-07-01T10:30:00.000Z"
        }
    }
}
```

#### 3. Change Password
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/users/change-password`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "Password changed successfully",
    "data": null
}
```

#### 4. Delete Account
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/users/account`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
    "password": "Password123"
}
```
- **Expected Response**:
```json
{
    "success": true,
    "message": "Account deleted successfully",
    "data": null
}
```

---

### 🏥 **Health Check Route**

#### Server Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Headers**: None required
- **Body**: None
- **Expected Response**:
```json
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-07-04T10:30:00.000Z"
}
```

---

## 🔧 **Testing Workflow in Postman**

### Step 1: Setup Environment
1. Create a new Environment in Postman
2. Add variable: `base_url` = `http://localhost:5000`
3. Add variable: `access_token` = (leave empty initially)

### Step 2: Test Authentication Flow
1. **Register** a new user
2. **Login** with the credentials
3. Copy the `accessToken` from login response
4. Set the `access_token` environment variable
5. Test **Get Profile** to verify token works

### Step 3: Test Recipe Features
1. **Generate a recipe** using AI
2. **Get all recipes** to see the generated recipe
3. **Search recipes** with a keyword
4. **Get recipe by ID** using a specific recipe ID
5. **Delete a recipe** (optional)

### Step 4: Test User Management
1. **Update profile** (change username)
2. **Get dashboard stats**
3. **Change password** (optional)

### Step 5: Error Testing
1. Try accessing protected routes without token
2. Try invalid login credentials
3. Try generating recipe with empty name
4. Try accessing non-existent recipe ID

---

## ⚠️ **Common Headers for All Requests**

### For Public Routes (no auth required):
```
Content-Type: application/json
```

### For Protected Routes (auth required):
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 🚨 **Error Response Format**

All error responses follow this format:
```json
{
    "success": false,
    "message": "Error message here",
    "timestamp": "2025-07-04T10:30:00.000Z",
    "errors": [] // Optional validation errors array
}
```

---

## 📝 **Rate Limiting Information**

- **General API**: 100 requests per 15 minutes
- **Authentication routes**: 5 requests per 15 minutes  
- **Recipe generation**: 3 requests per minute

If you hit rate limits, you'll receive a 429 status code with appropriate message.

---

## 🔍 **Validation Rules**

### User Registration:
- `username`: 3-20 characters, alphanumeric + underscore only
- `email`: Valid email format
- `password`: Min 6 chars, must contain uppercase, lowercase, and number

### Recipe Generation:
- `recipeName`: 2-100 characters, required

### Profile Update:
- `username`: 3-20 characters, alphanumeric + underscore only (optional)

---

### 📝 **Recipe Name Examples for Testing**

Here are some recipe names that work well with the AI:

**Indian Cuisine:**
```json
{ "recipeName": "Butter Chicken" }
{ "recipeName": "Vegetable Biryani" }
{ "recipeName": "Palak Paneer" }
{ "recipeName": "Masala Dosa" }
```

**International Cuisine:**
```json
{ "recipeName": "Chicken Alfredo Pasta" }
{ "recipeName": "Beef Tacos" }
{ "recipeName": "Caesar Salad" }
{ "recipeName": "Chocolate Chip Cookies" }
```

**Healthy Options:**
```json
{ "recipeName": "Quinoa Buddha Bowl" }
{ "recipeName": "Grilled Salmon with Vegetables" }
{ "recipeName": "Green Smoothie" }
```

---

## 🔧 **Troubleshooting**

### Common Issues and Solutions:

#### 1. **Gemini API Issues**
**Error**: `models/gemini-pro is not found`
**Solution**: Model name has been updated to `gemini-1.5-flash`
- Make sure you have a valid Gemini API key
- Check if your API key has the correct permissions

#### 2. **Authentication Errors**
**Error**: `No token provided, authorization denied`
**Solution**: 
- Make sure to include `Bearer ` prefix in Authorization header
- Copy the full token from login response
- Check if token has expired (15 minutes default)

#### 3. **MongoDB Connection Issues**
**Error**: `MongoDB connection failed`
**Solution**:
- Ensure MongoDB is running on your system
- Check the `MONGODB_URI` in your `.env` file
- Default: `mongodb://localhost:27017/recipe_generator`

#### 4. **Rate Limiting**
**Error**: `Too many requests`
**Solution**:
- Wait for the rate limit window to reset
- Auth routes: 5 requests per 15 minutes
- Recipe generation: 3 requests per minute

#### 5. **Environment Variables**
**Error**: `Missing required environment variables`
**Solution**:
- Copy `.env.example` to `.env`
- Fill in all required values:
  - `MONGODB_URI`
  - `JWT_SECRET` (minimum 32 characters)
  - `JWT_REFRESH_SECRET` (minimum 32 characters)  
  - `GEMINI_API_KEY`

---

This comprehensive guide covers all API endpoints with example requests and responses for easy testing in Postman!
