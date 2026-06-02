import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import clsx from 'clsx'

export default function DashboardLayout() {
  const { sidebarOpen } = useSelector((s: RootState) => s.ui)

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar />
      <div
        className={clsx(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
