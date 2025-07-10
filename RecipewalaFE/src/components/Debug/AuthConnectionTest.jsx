import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser, registerUser } from '../../features/auth/authSlice'

const AuthConnectionTest = () => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()

  const testRegistration = async () => {
    setIsLoading(true)
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!'
      }

      console.log('🧪 Testing registration with:', { ...testUser, password: '[HIDDEN]' })
      
      const result = await dispatch(registerUser(testUser)).unwrap()
      
      setTestResults(prev => ({
        ...prev,
        registration: {
          success: true,
          data: result,
          message: 'Registration successful!'
        }
      }))
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        registration: {
          success: false,
          error: error,
          message: 'Registration failed'
        }
      }))
    }
    setIsLoading(false)
  }

  const testLogin = async () => {
    setIsLoading(true)
    try {
      // Use actual credentials you know work
      const credentials = {
        email: 'test@example.com', // Replace with real test email
        password: 'testpassword123' // Replace with real test password
      }

      console.log('🧪 Testing login with:', { ...credentials, password: '[HIDDEN]' })
      
      const result = await dispatch(loginUser(credentials)).unwrap()
      
      setTestResults(prev => ({
        ...prev,
        login: {
          success: true,
          data: result,
          message: 'Login successful!'
        }
      }))
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        login: {
          success: false,
          error: error,
          message: 'Login failed - try with valid credentials'
        }
      }))
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">🔐 Auth Integration Test</h3>
      
      <div className="bg-white rounded p-4 mb-4">
        <p className="text-sm text-green-700 mb-2">
          ✅ Your backend connection is working! Now let's test the actual auth flow.
        </p>
        <div className="text-xs text-green-600">
          <div>✅ Base URL: http://localhost:5000</div>
          <div>✅ Login endpoint: /auth/login (returns 400 - expects valid data)</div>
          <div>✅ Register endpoint: /auth/register (returns 400 - expects valid data)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={testRegistration}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '⏳ Testing...' : '📝 Test Registration'}
        </button>
        
        <button
          onClick={testLogin}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? '⏳ Testing...' : '🔑 Test Login'}
        </button>
      </div>

      {/* Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-3">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className={`p-3 rounded border ${
              result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium capitalize">{test}</span>
                <span className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.success ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.error && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">View Error Details</summary>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
        <p className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> If login fails, update the test credentials above with actual user credentials from your database.
        </p>
      </div>
    </div>
  )
}

export default AuthConnectionTest