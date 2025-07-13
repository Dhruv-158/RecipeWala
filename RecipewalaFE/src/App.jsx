import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { loadUser } from './features/auth/loadUser'
import Layout from './components/Layout/Layout'
import AuthLayout from './components/Layout/AuthLayout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LandingPage from './pages/Landing/LandingPage'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import RecipeGenerator from './pages/Recipes/RecipeGenerator'
import RecipeDetail from './pages/Recipes/RecipeDetail'
import RecipeList from './pages/Recipes/RecipeList'
import Collections from './pages/Collections/Collections'
import ShoppingList from './pages/ShoppingList/ShoppingList'
import Profile from './pages/Profile/Profile'
import NotFound from './pages/NotFound/NotFound'

import BackendTest from './components/Debug/BackendTest'

// Simple CollectionDetail placeholder component
const CollectionDetail = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Detail</h1>
        <p className="text-gray-600">Collection detail view - Coming soon in next update!</p>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  // Load user profile on app start (if token exists)
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(loadUser())
    }
  }, [dispatch])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RecipeWala...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Debug Route */}
        <Route path="/debug" element={<BackendTest />} />
        
        {/* Landing Page - Root Route */}
        <Route path="/" element={
          !isAuthenticated ? (
            <LandingPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Public Authentication Routes */}
        <Route path="/login" element={
          !isAuthenticated ? (
            <AuthLayout>
              <Login />
            </AuthLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />
        
        <Route path="/register" element={
          !isAuthenticated ? (
            <AuthLayout>
              <Register />
            </AuthLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Protected Application Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/generate" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<RecipeGenerator />} />
        </Route>

        <Route path="/recipes" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<RecipeList />} />
          <Route path=":id" element={<RecipeDetail />} />
        </Route>

        <Route path="/collections" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Collections />} />
          <Route path=":id" element={<CollectionDetail />} />
        </Route>

        <Route path="/shopping-list" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<ShoppingList />} />
        </Route>

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Profile />} />
        </Route>

        {/* Alternative: Keep the old nested route structure for backward compatibility */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="generate" element={<RecipeGenerator />} />
          <Route path="recipes" element={<RecipeList />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="collections" element={<Collections />} />
          <Route path="collections/:id" element={<CollectionDetail />} />
          <Route path="shopping-list" element={<ShoppingList />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App