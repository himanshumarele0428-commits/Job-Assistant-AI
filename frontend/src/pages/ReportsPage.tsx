import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, FileText } from 'lucide-react'
import client from '@/api/client'
import { jobsApi } from '@/api/jobs'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      client.get('/reports/monthly'),
      jobsApi.statusCounts(),
    ]).then(([r, s]) => {
      setData(r.data)
      setStats(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format)
    try {
      const response = await client.get(`/reports/export/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = format === 'csv' ? 'job_applications.csv' : 'job_applications_report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  if (loading) return <div className="page-container flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  const totalApps = data?.total || 0
  const interviewRate = totalApps > 0 ? `${((stats.interview_scheduled || 0) / totalApps * 100).toFixed(1)}%` : '0%'
  const offerRate = totalApps > 0 ? `${((stats.offer_received || 0) / totalApps * 100).toFixed(1)}%` : '0%'
  const rejectionRate = totalApps > 0 ? `${((stats.rejected || 0) / totalApps * 100).toFixed(1)}%` : '0%'

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reports & Analytics</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Insights into your application journey</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Applications', value: totalApps, color: 'text-primary-600' },
          { label: 'Interview Rate', value: interviewRate, color: 'text-amber-600' },
          { label: 'Offer Rate', value: offerRate, color: 'text-green-600' },
          { label: 'Rejection Rate', value: rejectionRate, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className="text-sm text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText size={18} /> Recent Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Job Title</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.applications?.slice(0, 20).map((app: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-900 dark:text-white">{app.title}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{app.company}</td>
                  <td className="py-3"><span className={`badge text-xs status-${app.status}`}>{app.status?.replace(/_/g, ' ')}</span></td>
                  <td className="py-3 text-gray-400">{app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={() => handleExport('csv')} disabled={exporting === 'csv'} className="btn-outline flex items-center gap-2 text-sm">
          <Download size={14} /> {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
        </button>
        <button onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'} className="btn-outline flex items-center gap-2 text-sm">
          <Download size={14} /> {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
    </div>
  )
}
