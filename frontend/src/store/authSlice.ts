import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string
    full_name: string
    email: string
    role: string
  } | null
  isAuthenticated: boolean
  apiKey: string
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  apiKey: localStorage.getItem('groq_api_key') || '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
    },
    setApiKey(state, action: PayloadAction<string>) {
      state.apiKey = action.payload
      localStorage.setItem('groq_api_key', action.payload)
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})

export const { setUser, clearUser, setApiKey, logout } = authSlice.actions
export default authSlice.reducer
