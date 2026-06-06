import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, FileText, LineChart, FileCheck,
  PenLine, Bell, Search, History, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { toggleSidebar } from '@/store/uiSlice'
import { logout } from '@/store/authSlice'
import clsx from 'clsx'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/resumes', icon: FileText, label: 'Resumes' },
  { to: '/ats', icon: LineChart, label: 'ATS Checker' },
  { to: '/cover-letter', icon: PenLine, label: 'Cover Letter' },
  { to: '/search', icon: Search, label: 'Job Search' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarOpen } = useSelector((s: RootState) => s.ui)
  const { user } = useSelector((s: RootState) => s.auth)
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (!sidebarOpen) {
    return (
      <motion.button
        onClick={() => dispatch(toggleSidebar())}
        className="fixed left-4 top-4 z-50 p-2 glass-card rounded-xl"
        whileHover={{ scale: 1.05 }}
      >
        <ChevronRight size={20} />
      </motion.button>
    )
  }

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      layout
      className="fixed left-0 top-0 h-screen w-64 glass-card rounded-none border-l-0 border-t-0 border-b-0 flex flex-col z-40 overflow-y-auto"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Briefcase className="text-primary-600" size={28} />
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">Job Assistant</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ChevronLeft size={16} />
      </button>
    </motion.aside>
  )
}
