const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">RecipeWala</h1>
          <p className="text-gray-600">Your AI-powered recipe companion</p>
        </div>
        
        {/* Auth form container */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2025 RecipeWala. Made with ❤️ for food lovers.
        </div>
      </div>
    </div>
  )
}

export default AuthLayout