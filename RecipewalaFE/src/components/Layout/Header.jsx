import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { toggleSidebar } from '../../features/ui/uiSlice'
import { logout } from '../../features/auth/authSlice'
import { authService } from '../../services/authService'
import { notificationService } from '../../services/notificationService'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

const Header = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileMenuRef = useRef(null)
  const notificationMenuRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState(null)

  // Search dropdown state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const searchRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications) {
      setNotificationsLoading(true)
      setNotificationsError(null)
      notificationService.getNotifications()
        .then(res => {
          // Support both res.data and res.data.notifications
          const data = res.data?.notifications || res.data || []
          setNotifications(Array.isArray(data) ? data : [])
        })
        .catch(err => {
          setNotificationsError('Failed to load notifications')
        })
        .finally(() => setNotificationsLoading(false))
    }
  }, [showNotifications])

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

  // Prefer username for initials, fallback to name, then 'U'
  const getInitials = (user) => {
    if (!user) return 'U';
    if (user.username) return user.username.slice(0, 2).toUpperCase();
    if (user.name) {
      return user.name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
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
          
          {/* Search bar - always visible, responsive width */}
          <div className="flex items-center relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl" ref={searchRef}>
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full min-w-0 text-sm"
              value={searchTerm}
              onChange={async (e) => {
                const value = e.target.value
                setSearchTerm(value)
                setSearchError(null)
                if (value.trim().length < 2) {
                  setSearchResults([])
                  setShowSearchDropdown(false)
                  return
                }
                setSearchLoading(true)
                setShowSearchDropdown(true)
                try {
                  // Use your recipeService or direct API call
                  const res = await import('../../services/recipeService').then(m => m.recipeService.getUserRecipes({ search: value, limit: 20 }))
                  const recipes = res.data?.recipes || res.data?.data?.recipes || []
                  // Only match recipe names (case-insensitive, partial match)
                  const filtered = recipes.filter(r => {
                    const name = (r.title || r.name || '').toLowerCase()
                    return name.includes(value.trim().toLowerCase())
                  })
                  setSearchResults(filtered.map(r => ({
                    id: r.id || r._id,
                    title: r.title || r.name
                  })))
                } catch (err) {
                  setSearchError('Failed to search recipes')
                  setSearchResults([])
                } finally {
                  setSearchLoading(false)
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true)
              }}
            />
            {showSearchDropdown && (
              <div className="absolute left-0 top-12 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                {searchLoading ? (
                  <div className="px-4 py-3 text-gray-400 text-sm">Searching...</div>
                ) : searchError ? (
                  <div className="px-4 py-3 text-red-400 text-sm">{searchError}</div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-gray-400 text-sm">No recipes found</div>
                ) : (
                  <ul>
                    {searchResults.map((recipe) => (
                      <li
                        key={recipe.id}
                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          navigate(`/recipes/${recipe.id}`)
                          setShowSearchDropdown(false)
                          setSearchTerm('')
                        }}
                      >
                        <span className="font-medium text-gray-800 truncate">{recipe.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}


          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {notifications.length > 0 ? notifications.length : 0}
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-800">Notifications</div>
                {notificationsLoading ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</div>
                ) : notificationsError ? (
                  <div className="px-4 py-6 text-center text-red-400 text-sm">{notificationsError}</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</div>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif._id || notif.id || notif.createdAt}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-start gap-2"
                      >
                        {/* Optionally add an icon or emoji based on notif.type */}
                        <span className="inline-block mt-0.5">🔔</span>
                        <span className="flex-1">{notif.message || notif.text || notif.title || 'Notification'}</span>
                      </div>
                    ))}
                    <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">{notifications.length > 5 ? 'View all' : 'No more notifications'}</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(user)}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.username || user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.username || user?.name}</p>
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