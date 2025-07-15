// UPDATE: src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store, persistor } from './app/store'
import App from './App.jsx'
import ErrorBoundary from './components/Common/ErrorBoundary'
import LoadingSpinner from './components/Common/LoadingSpinner'
import './index.css'
import './styles/landing.css'

// React Query client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (error?.response?.status && [401, 403, 404].includes(error.response.status)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate 
            loading={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <LoadingSpinner size="large" className="mx-auto mb-4" />
                  <p className="text-gray-600">Loading RecipeWala...</p>
                </div>
              </div>
            } 
            persistor={persistor}
          >
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <App />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '14px',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: '#f97316',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </BrowserRouter>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)