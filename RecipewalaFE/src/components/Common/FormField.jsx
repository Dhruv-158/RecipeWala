import { forwardRef } from 'react'

const FormField = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        )}
        <input
          ref={ref}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField