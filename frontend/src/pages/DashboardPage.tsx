import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, CalendarCheck, CheckCircle, XCircle, TrendingUp, Award, Clock, ArrowUpRight } from 'lucide-react'
import { dashboardApi, DashboardStats, MonthlyData } from '@/api/dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8', applied: '#3b82f6', in_progress: '#7c3aed',
  interview_scheduled: '#f59e0b', selected: '#14b8a6',
  offer_received: '#22c55e', rejected: '#ef4444', done: '#22c55e',
}

const statIcons: Record<string, React.ReactNode> = {
  total: <Briefcase size={20} />,
  interviews: <CalendarCheck size={20} />,
  offers: <Award size={20} />,
  rejected: <XCircle size={20} />,
  completed: <CheckCircle size={20} />,
  ats: <TrendingUp size={20} />,
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData | null>(null)
  const [companies, setCompanies] = useState<{ company: string; count: number }[]>([])
  const [atsTrend, setAtsTrend] = useState<{ date: string; score: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.monthlyApps(),
      dashboardApi.companies(),
      dashboardApi.atsTrend(),
    ]).then(([s, m, c, a]) => {
      setStats(s.data)
      setMonthly(m.data)
      setCompanies(c.data)
      setAtsTrend(a.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const pieData = stats
    ? Object.entries(stats.by_status)
        .filter(([, c]) => c > 0)
        .map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }))
    : []

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your job application overview</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Applied', value: stats?.total_jobs || 0, key: 'total', color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Interviews', value: stats?.interviews || 0, key: 'interviews', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Offers', value: stats?.offers || 0, key: 'offers', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Avg ATS Score', value: `${stats?.average_ats_score || 0}%`, key: 'ats', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
        ].map((card, i) => (
          <motion.div key={card.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.color}`}>{statIcons[card.key]}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400"><Clock size={12} /> Updated just now</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Monthly Applications */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Applications</h3>
          {monthly && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name.replace(/ /g, '_')] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data yet</p>
          )}
        </motion.div>

        {/* ATS Score Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ATS Score Trend</h3>
          {atsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={atsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Run your first ATS analysis</p>
          )}
        </motion.div>

        {/* Company Breakdown */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Companies</h3>
          {companies.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={companies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
