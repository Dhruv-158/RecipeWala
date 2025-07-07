import { useState } from 'react'

const NetworkDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({})
  const [isChecking, setIsChecking] = useState(false)

  const checkEnvironment = () => {
    const info = {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      nodeEnv: import.meta.env.NODE_ENV,
      mode: import.meta.env.MODE,
      allEnvVars: import.meta.env
    }
    setDebugInfo(info)
    console.log('🔍 Environment Debug Info:', info)
  }

  const testDirectConnection = async () => {
    setIsChecking(true)
    const results = []
    
    // Test different possible URLs
    const testUrls = [
      'http://localhost:5000',
      'http://localhost:5000/api',
      'http://localhost:3000',
      'http://localhost:3000/api',
      'http://localhost:8000',
      'http://localhost:8000/api',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5000/api'
    ]

    for (const url of testUrls) {
      try {
        console.log(`🔄 Testing: ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors'
        })
        
        results.push({
          url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          type: 'success'
        })
        
        console.log(`✅ ${url} - Status: ${response.status}`)
        
      } catch (error) {
        results.push({
          url,
          error: error.message,
          type: 'error'
        })
        console.log(`❌ ${url} - Error: ${error.message}`)
      }
    }
    
    setDebugInfo(prev => ({ ...prev, connectionTests: results }))
    setIsChecking(false)
  }

  const testSpecificEndpoints = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    if (!baseUrl) {
      alert('Please set VITE_API_BASE_URL in your .env file first!')
      return
    }

    setIsChecking(true)
    const endpoints = [
      '',
      '/health',
      '/auth',
      '/auth/login',
      '/auth/register'
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        const fullUrl = `${baseUrl}${endpoint}`
        console.log(`🔄 Testing endpoint: ${fullUrl}`)
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const responseText = await response.text()
        
        results.push({
          endpoint: fullUrl,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          responseText: responseText.substring(0, 200),
          type: 'success'
        })
        
        console.log(`✅ ${fullUrl} - Status: ${response.status}`)
        
      } catch (error) {
        results.push({
          endpoint: `${baseUrl}${endpoint}`,
          error: error.message,
          type: 'error'
        })
        console.log(`❌ ${baseUrl}${endpoint} - Error: ${error.message}`)
      }
    }
    
    setDebugInfo(prev => ({ ...prev, endpointTests: results }))
    setIsChecking(false)
  }

  const checkBrowserConsole = () => {
    console.log('🔍 === BROWSER CONSOLE DEBUG INFO ===')
    console.log('📍 Current URL:', window.location.href)
    console.log('🌐 User Agent:', navigator.userAgent)
    console.log('📡 Online Status:', navigator.onLine)
    console.log('🔧 Environment Variables:', import.meta.env)
    console.log('📊 Local Storage:', localStorage)
    console.log('🍪 Document Cookie:', document.cookie)
    console.log('🔍 === END DEBUG INFO ===')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-red-800 mb-4">🚨 Network Error Debugger</h2>
        
        <div className="bg-white rounded p-4 mb-4">
          <h3 className="font-semibold mb-2">🔍 Quick Checks:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span>📍 API Base URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.VITE_API_BASE_URL || 'NOT SET'}
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌐 Browser Online:</span>
              <span className={navigator.onLine ? 'text-green-600' : 'text-red-600'}>
                {navigator.onLine ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={checkEnvironment}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔧 Check Environment
          </button>
          
          <button
            onClick={testDirectConnection}
            disabled={isChecking}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isChecking ? '⏳ Testing...' : '🔌 Test All Ports'}
          </button>
          
          <button
            onClick={testSpecificEndpoints}
            disabled={isChecking}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isChecking ? '⏳ Testing...' : '🎯 Test API Endpoints'}
          </button>
          
          <button
            onClick={checkBrowserConsole}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            📊 Log Debug Info
          </button>
        </div>
      </div>

      {/* Environment Info */}
      {debugInfo.apiBaseUrl && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Environment Variables</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>VITE_API_BASE_URL: <span className="text-blue-600">{debugInfo.apiBaseUrl}</span></div>
            <div>NODE_ENV: <span className="text-green-600">{debugInfo.nodeEnv}</span></div>
            <div>MODE: <span className="text-purple-600">{debugInfo.mode}</span></div>
          </div>
        </div>
      )}

      {/* Connection Test Results */}
      {debugInfo.connectionTests && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🔌 Connection Test Results</h3>
          <div className="space-y-2">
            {debugInfo.connectionTests.map((test, index) => (
              <div key={index} className={`p-3 rounded border ${
                test.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{test.url}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {test.type === 'success' ? `${test.status} ${test.statusText}` : test.error}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoint Test Results */}
      {debugInfo.endpointTests && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Endpoint Test Results</h3>
          <div className="space-y-3">
            {debugInfo.endpointTests.map((test, index) => (
              <div key={index} className={`p-3 rounded border ${
                test.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{test.endpoint}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {test.type === 'success' ? `${test.status}` : 'Error'}
                  </span>
                </div>
                {test.type === 'success' && test.responseText && (
                  <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {test.responseText}...
                  </div>
                )}
                {test.type === 'error' && (
                  <div className="text-xs text-red-600">
                    {test.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">🛠 Troubleshooting Steps</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-yellow-800">1. Check Backend Server Status</h4>
            <ul className="mt-1 text-yellow-700 list-disc list-inside ml-4">
              <li>Is your backend server running?</li>
              <li>Check terminal/console where you started the backend</li>
              <li>Look for any error messages in backend logs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800">2. Verify Backend URL & Port</h4>
            <ul className="mt-1 text-yellow-700 list-disc list-inside ml-4">
              <li>Check what port your backend is running on</li>
              <li>Update VITE_API_BASE_URL in .env file</li>
              <li>Restart frontend after changing .env</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800">3. Test Backend Directly</h4>
            <ul className="mt-1 text-yellow-700 list-disc list-inside ml-4">
              <li>Open browser and go to: <code>http://localhost:YOUR_PORT</code></li>
              <li>Try: <code>http://localhost:YOUR_PORT/api</code></li>
              <li>Should see some response (not connection refused)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800">4. Check CORS Configuration</h4>
            <ul className="mt-1 text-yellow-700 list-disc list-inside ml-4">
              <li>Backend must allow requests from frontend origin</li>
              <li>Add CORS middleware to your backend</li>
              <li>Allow origin: http://localhost:5173</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkDebugger