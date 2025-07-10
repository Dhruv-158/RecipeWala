import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// Async thunks for API calls
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      
      // Flexible response handling - adjust based on your backend response format
      const responseData = response.data
      
      // Handle different possible response formats
      let user, accessToken
      
      if (responseData.user && (responseData.accessToken || responseData.token)) {
        // Format: { user: {...}, accessToken: "..." } or { user: {...}, token: "..." }
        user = responseData.user
        accessToken = responseData.accessToken || responseData.token
      } else if (responseData.data) {
        // Format: { data: { user: {...}, accessToken: "..." } }
        user = responseData.data.user
        accessToken = responseData.data.accessToken || responseData.data.token
      } else if (responseData.id || responseData._id) {
        // Format: { id: "...", name: "...", email: "...", accessToken: "..." }
        user = {
          id: responseData.id || responseData._id,
          name: responseData.name,
          email: responseData.email,
          ...responseData
        }
        accessToken = responseData.accessToken || responseData.token
      } else {
        // Fallback - log the response and throw error
        console.error('Unexpected response format:', responseData)
        throw new Error('Unexpected response format from server')
      }
      
      console.log('✅ Registration successful, storing user:', user)
      
      return { user, accessToken }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed'
      return rejectWithValue(errorMessage)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      
      // Flexible response handling - adjust based on your backend response format
      const responseData = response.data
      
      // Handle different possible response formats
      let user, accessToken
      
      if (responseData.user && (responseData.accessToken || responseData.token)) {
        // Format: { user: {...}, accessToken: "..." } or { user: {...}, token: "..." }
        user = responseData.user
        accessToken = responseData.accessToken || responseData.token
      } else if (responseData.data) {
        // Format: { data: { user: {...}, accessToken: "..." } }
        user = responseData.data.user
        accessToken = responseData.data.accessToken || responseData.data.token
      } else if (responseData.id || responseData._id) {
        // Format: { id: "...", name: "...", email: "...", accessToken: "..." }
        user = {
          id: responseData.id || responseData._id,
          name: responseData.name,
          email: responseData.email,
          ...responseData
        }
        accessToken = responseData.accessToken || responseData.token
      } else {
        // Fallback - log the response and throw error
        console.error('Unexpected response format:', responseData)
        throw new Error('Unexpected response format from server')
      }
      
      console.log('✅ Login successful, storing user:', user)
      
      return { user, accessToken }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed'
      return rejectWithValue(errorMessage)
    }
  }
)

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('🔄 Logging out - clearing auth state')
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      console.log('🔄 Setting credentials:', { user, hasToken: !!accessToken })
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        console.log('🔄 Registration pending...')
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('✅ Registration fulfilled:', action.payload);
        const { user, accessToken } = action.payload;
        if (user && accessToken) {
          state.isLoading = false;
          state.user = user;
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          state.error = null;
        } else {
          state.isLoading = false;
          state.error = 'Invalid response from server';
          state.isAuthenticated = false;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log('❌ Registration rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        console.log('🔄 Login pending...')
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('✅ Login fulfilled:', action.payload);
        const { user, accessToken } = action.payload;
        if (user && accessToken) {
          state.isLoading = false;
          state.user = user;
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          state.error = null;
        } else {
          state.isLoading = false;
          state.error = 'Invalid response from server';
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload)
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
  },
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer