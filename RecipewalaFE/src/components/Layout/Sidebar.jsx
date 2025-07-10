import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  BookOpen, 
  User, 
  ChefHat,
  X,
  Folder,
  ShoppingCart
} from 'lucide-react'
import { toggleSidebar, setSidebarOpen } from '../../features/ui/uiSlice'
import logoImg from '../../assets/images/logo.png'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate Recipe', href: '/generate', icon: Plus },
  { name: 'My Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Collections', href: '/collections', icon: Folder },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
  { name: 'Profile', href: '/profile', icon: User },
]

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (href) => {
    navigate(href)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false))
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden lg:block`}>
        
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2">
                <img src={logoImg} alt="RecipeWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain rounded-xl lg:rounded-2xl bg-white shadow-lg" />
                <span className="text-xl font-bold text-gray-800">RecipeWala</span>
              </div>
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </>
          ) : (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="mx-auto"
            >
              <img src={logoImg} alt="RecipeWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain rounded-xl lg:rounded-2xl bg-white shadow-lg" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img src={logoImg} alt="RecipeWala Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain rounded-xl lg:rounded-2xl bg-white shadow-lg" />
            <span className="text-xl font-bold text-gray-800">RecipeWala</span>
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Sidebar