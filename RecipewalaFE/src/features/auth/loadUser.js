import { createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'
import { setCredentials, logout } from './authSlice'

// Thunk to load user profile on app start
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.getProfile()
      const user = response.data.user || response.data
      if (user) {
        // Optionally, get token from localStorage if you store it
        const accessToken = localStorage.getItem('accessToken')
        dispatch(setCredentials({ user, accessToken }))
        return user
      } else {
        dispatch(logout())
        return rejectWithValue('No user found')
      }
    } catch (err) {
      dispatch(logout())
      return rejectWithValue(err.response?.data?.message || 'Failed to load user')
    }
  }
)
