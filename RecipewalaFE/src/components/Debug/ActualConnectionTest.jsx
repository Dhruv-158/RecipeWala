import { useState } from 'react'
import api from '../../services/api'
import { authService } from '../../services/authService'

const ActualConnectionTest = () => {
  const [results, setResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const testActualConnection = async () => {
    setIsLoading(true)
    const testResults = {}

    // Test 1: Check environment variable
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    testResults.envVar = {
      value: apiBaseUrl,
      status: apiBaseUrl ? 'Set' : 'Not Set'
    }

    // Test 2: Test base URL directly
    try {
      console.log('🔄 Testing base URL:', apiBaseUrl)
      const response = await fetch(apiBaseUrl)
      const data = await response.text()
      
      testResults.baseUrl = {
        status: response.status,
        ok: response.ok,
        data: data.substring(0, 200),
        type: 'success'
      }
    } catch (error) {
      testResults.baseUrl = {
        error: error.message,
        type: 'error'
      }
    }

    // Test 3: Test auth endpoints that your frontend will actually call
    const authEndpoints = ['/auth', '/auth/login', '/auth/register']
    
    for (const endpoint of authEndpoints) {
      try {
        const fullUrl = `${apiBaseUrl}${endpoint}`
        console.log('🔄 Testing auth endpoint:', fullUrl)
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Empty body to test if endpoint exists
        })
        
        testResults[`auth${endpoint.replace('/', '_')}`] = {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          accessible: response.status !== 404,
          type: 'success'
        }
      } catch (error) {
        testResults[`auth${endpoint.replace('/', '_')}`] = {
          url: `${apiBaseUrl}${endpoint}`,
          error: error.message,
          type: 'error'
        }
      }
    }

    // Test 4: Test with actual API service
    try {
      console.log('🔄 Testing with API service...')
      const response = await api.get('/')
      testResults.apiService = {
        status: response.status,
        data: response.data,
        type: 'success'
      }
    } catch (error) {
      testResults.apiService = {
        error: error.message,
        details: error.response?.data,
        status: error.response?.status,
        type: 'error'
      }
    }

    setResults(testResults)
    setIsLoading(false)
  }

  const testRealAuth = async () => {
    setIsLoading(true)
    
    try {
      // Test with dummy credentials to see the actual error
      await authService.login({
        email: 'test@test.com',
        password: 'testpassword'
      })
    } catch (error) {
      setResults(prev => ({
        ...prev,
        realAuth: {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          type: error.response?.status === 404 ? 'endpoint_missing' : 'auth_error'
        }
      }))
    }
    
    setIsLoading(false)
  }

  const checkBrowserStorage = () => {
    const persistedState = localStorage.getItem('persist:recipewala-root')
    let authState = null
    
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState)
        authState = JSON.parse(parsed.auth)
      } catch (e) {
        authState = 'Parse Error'
      }
    }

    setResults(prev => ({
      ...prev,
      browserStorage: {
        persistedState: persistedState ? 'Found' : 'Not Found',
        authState: authState,
        type: 'info'
      }
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">🔍 Actual Connection Test</h2>
        
        <div className="bg-white rounded p-4 mb-4">
          <h3 className="font-semibold mb-2">Current Configuration:</h3>
          <div className="space-y-1 text-sm font-mono">
            <div>VITE_API_BASE_URL: <span className="text-blue-600">{import.meta.env.VITE_API_BASE_URL}</span></div>
            <div>Frontend URL: <span className="text-green-600">{window.location.origin}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testActualConnection}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '⏳ Testing...' : '🔌 Test Real Connection'}
          </button>
          
          <button
            onClick={testRealAuth}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? '⏳ Testing...' : '🔐 Test Auth Endpoints'}
          </button>
          
          <button
            onClick={checkBrowserStorage}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            📊 Check Browser State
          </button>
        </div>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Test Results</h3>
          
          <div className="space-y-4">
            {Object.entries(results).map(([test, result]) => (
              <div key={test} className={`border rounded-lg p-4 ${
                result.type === 'success' ? 'border-green-200 bg-green-50' : 
                result.type === 'error' ? 'border-red-200 bg-red-50' :
                result.type === 'endpoint_missing' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.type === 'success' ? 'bg-green-100 text-green-800' : 
                    result.type === 'error' ? 'bg-red-100 text-red-800' :
                    result.type === 'endpoint_missing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.type === 'success' ? `✅ ${result.status || 'Success'}` : 
                     result.type === 'error' ? '❌ Error' :
                     result.type === 'endpoint_missing' ? '⚠️ Not Found' :
                     'ℹ️ Info'}
                  </span>
                </div>
                
                <div className="text-sm space-y-2">
                  {result.url && (
                    <div><strong>URL:</strong> <code className="bg-white px-1 rounded">{result.url}</code></div>
                  )}
                  {result.value && (
                    <div><strong>Value:</strong> <code className="bg-white px-1 rounded">{result.value}</code></div>
                  )}
                  {result.error && (
                    <div className="text-red-700"><strong>Error:</strong> {result.error}</div>
                  )}
                  {result.data && (
                    <details className="bg-white rounded border p-2">
                      <summary className="cursor-pointer font-medium">View Response Data</summary>
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {result.details && (
                    <details className="bg-white rounded border p-2">
                      <summary className="cursor-pointer font-medium">View Error Details</summary>
                      <pre className="mt-2 text-xs overflow-x-auto text-red-600">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-yellow-800 mb-2">🤔 What the Results Mean:</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li><strong>✅ Success:</strong> Connection working, endpoint exists</li>
          <li><strong>❌ Error:</strong> Network/CORS issue, can't reach backend</li>
          <li><strong>⚠️ Not Found (404):</strong> Backend reachable, but endpoint doesn't exist</li>
          <li><strong>ℹ️ Info:</strong> Configuration and state information</li>
        </ul>
        
        <div className="mt-3 p-3 bg-white rounded border">
          <p className="text-sm text-yellow-800">
            <strong>Next Steps:</strong> If you see "Not Found" for auth endpoints, your backend routes might be different. 
            Share the auth endpoint results and I'll help you configure the correct paths!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActualConnectionTest