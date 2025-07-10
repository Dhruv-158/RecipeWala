import { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  ChefHat, 
  Heart, 
  Users, 
  Star,
  Settings
} from 'lucide-react'

// Fallback notification service
const fallbackNotificationService = {
  getNotifications: async () => ({
    data: {
      notifications: [
        {
          id: '1',
          type: 'recipe_like',
          title: 'Your recipe was liked!',
          message: 'Someone liked your Pasta Carbonara recipe',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You\'ve created 10 recipes this month',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  }),
  markAsRead: async (id) => ({ success: true }),
  markAllAsRead: async () => ({ success: true }),
  deleteNotification: async (id) => ({ success: true })
}

// Try to import the real notification service, fall back to mock if not available
let notificationService
try {
  notificationService = require('../../services/notificationService').notificationService
} catch (error) {
  console.warn('Notification service not found, using fallback data')
  notificationService = fallbackNotificationService
}

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getNotifications()
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'recipe_like':
      case 'recipe_favorite':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'recipe_share':
      case 'recipe_comment':
        return <ChefHat className="h-4 w-4 text-orange-500" />
      case 'follow':
      case 'friend_request':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'achievement':
      case 'milestone':
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'recipes') return ['recipe_like', 'recipe_favorite', 'recipe_share', 'recipe_comment'].includes(notif.type)
    if (filter === 'social') return ['follow', 'friend_request'].includes(notif.type)
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {unreadCount > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Mark all read</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, getIcon }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-orange-50 border-l-4 border-orange-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatTime(notification.createdAt)}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification.id)
              }}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="Mark as read"
            >
              <Check className="h-3 w-3 text-gray-500" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            title="Delete notification"
          >
            <Trash2 className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter