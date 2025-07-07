import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-yellow-600'
    }
  }

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700'
      case 'info': return 'bg-blue-600 hover:bg-blue-700'
      default: return 'bg-yellow-600 hover:bg-yellow-700'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`h-6 w-6 ${getIconColor()}`} />
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">{message}</p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonColor()}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog