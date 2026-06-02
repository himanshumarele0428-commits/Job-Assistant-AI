import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/router/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import JobsPage from '@/pages/JobsPage'
import ResumesPage from '@/pages/ResumesPage'
import ATSCheckerPage from '@/pages/ATSCheckerPage'
import CoverLetterPage from '@/pages/CoverLetterPage'
import JobSearchPage from '@/pages/JobSearchPage'
import RemindersPage from '@/pages/RemindersPage'
import HistoryPage from '@/pages/HistoryPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import AdminPage from '@/pages/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'resumes', element: <ResumesPage /> },
      { path: 'ats', element: <ATSCheckerPage /> },
      { path: 'cover-letter', element: <CoverLetterPage /> },
      { path: 'search', element: <JobSearchPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])
