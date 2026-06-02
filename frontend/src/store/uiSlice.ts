import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  sidebarCollapsed: boolean
}

const initialState: UIState = {
  darkMode: localStorage.getItem('dark_mode') === 'true',
  sidebarOpen: true,
  sidebarCollapsed: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('dark_mode', String(state.darkMode))
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { toggleDarkMode, setSidebarOpen, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
