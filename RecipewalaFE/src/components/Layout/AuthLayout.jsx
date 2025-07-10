const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-[Dancing Script]">
      {/* Left Side - Kitchen Illustration */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-50 to-yellow-50 flex items-end justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="max-w-md text-center">
          {/* Logo - Top Left on All Screens */}
          <div className="flex items-center gap-3 sm:gap-4 absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-10">
            <img src={logoImg} alt="RecipeWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain rounded-xl lg:rounded-2xl bg-white shadow-lg" />
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 kitchen-subtitle">RecipeWala</h1>
          </div>

          {/* Quote */}
          <div className="text-center mt-16 sm:mt-20 lg:mt-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-8 leading-tight kitchen-title">
              Every Grain Tells a Story,<br />
              Every Recipe Creates a Memory
            </h2>
          </div>

          {/* Kitchen Illustration */}
          <div className="mb-8">
            <KitchenIllustration />
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {/* Auth Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-600">
            © 2025 RecipeWala. Made with ❤️ for food lovers.
          </div>
        </div>
      </div>
    </div>
  )
}

// Logo and Kitchen Illustration Images
import logoImg from '../../assets/images/logo.png'
import kitchenImg from '../../assets/images/kitchen.png'

const KitchenIllustration = () => {
  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
      <img src={kitchenImg} alt="Kitchen" className="w-full h-auto rounded-2xl shadow-lg" />
    </div>
  )
}

export default AuthLayout