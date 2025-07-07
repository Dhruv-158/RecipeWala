import { useState } from 'react'
import { authService } from '../../services/authService'
import api from '../../services/api'

import NetworkDebugger from './NetworkDebugger'
import ActualConnectionTest from './ActualConnectionTest'
import AuthConnectionTest from './AuthConnectionTest'

const BackendTest = () => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testName, testFunction) => {
    setIsLoading(true)
    try {
      const result = await testFunction()
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }))
    }
    setIsLoading(false)
  }

  const testBackendConnection = async () => {
    const response = await api.get('/health')
    return response.data
  }

  const testLogin = async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'testpassword'
    })
    return response.data
  }

  const testRegister = async () => {
    const response = await authService.register({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'testpassword123'
    })
    return response.data
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 m-4">
      <AuthConnectionTest />
      <ActualConnectionTest />
      <NetworkDebugger />
      
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="space-y-3">
        <button
          onClick={() => runTest('connection', testBackendConnection)}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Backend Connection
        </button>
        
        <button
          onClick={() => runTest('login', testLogin)}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={() => runTest('register', testRegister)}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Register
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="space-y-2">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="font-medium capitalize">{test}</div>
              <div className="text-sm">
                {result.success ? (
                  <pre className="text-green-800">{JSON.stringify(result.data, null, 2)}</pre>
                ) : (
                  <span className="text-red-800">{result.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BackendTest