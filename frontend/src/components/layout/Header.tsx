import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { toggleDarkMode, toggleSidebar } from '@/store/uiSlice'
import { logout } from '@/store/authSlice'
import { Menu, Moon, Sun, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { darkMode } = useSelector((s: RootState) => s.ui)
  const { user } = useSelector((s: RootState) => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 glass-card border-l-0 border-r-0 border-t-0 px-6 py-3 flex items-center justify-between">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <SettingsIcon size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
