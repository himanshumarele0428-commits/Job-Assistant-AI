import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, Activity, Shield } from 'lucide-react'
import client from '@/api/client'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/admin/stats'),
      client.get('/admin/users'),
    ]).then(([s, u]) => {
      setStats(s.data)
      setUsers(u.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-container flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-accent-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-gray-500 dark:text-gray-400">Platform management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3"><Users className="text-primary-600" size={20} /><span className="text-sm text-gray-400">Total Users</span></div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3"><Briefcase className="text-primary-600" size={20} /><span className="text-sm text-gray-400">Total Jobs</span></div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_jobs || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3"><Activity className="text-primary-600" size={20} /><span className="text-sm text-gray-400">Active Users</span></div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.filter((u: any) => u.is_active).length}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{u.full_name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3"><span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{u.role}</span></td>
                  <td className="py-3"><span className={`badge ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
