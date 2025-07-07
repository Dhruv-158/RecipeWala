import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { toggleSidebar } from '../../features/ui/uiSlice'
import { logout } from '../../features/auth/authSlice'
import { authService } from '../../services/authService'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

const Header = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileMenuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setShowProfileMenu(false)
      
      // Call backend logout endpoint
      await authService.logout()
      
      // Clear Redux state
      dispatch(logout())
      
      // Navigate to login
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if backend logout fails, clear local state
      dispatch(logout())
      navigate('/login')
      toast.error('Logout completed with errors')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Search bar */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(user?.name)}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/profile')
                    setShowProfileMenu(false)
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement settings page
                    setShowProfileMenu(false)
                    toast.info('Settings coming soon!')
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header