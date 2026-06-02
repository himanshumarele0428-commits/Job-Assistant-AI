import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { History, Building2, Calendar } from 'lucide-react'
import { jobsApi, Job } from '@/api/jobs'
import { format } from 'date-fns'

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsApi.list({ sort_by: 'updated_at', sort_order: 'desc', page_size: 100 })
      .then(r => setJobs(r.data.items))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-container flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  // Group by month
  const grouped: Record<string, Job[]> = {}
  jobs.forEach(job => {
    const month = job.date_applied
      ? format(new Date(job.date_applied), 'MMMM yyyy')
      : 'No Date'
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(job)
  })

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Application History</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Timeline of all your applications</p>

      <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
        {Object.entries(grouped).map(([month, monthJobs]) => (
          <div key={month}>
            <div className="flex items-center gap-3 mb-4 -ml-[41px]">
              <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-gray-900" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{month}</h3>
              <span className="text-xs text-gray-400">({monthJobs.length} applications)</span>
            </div>
            <div className="space-y-3 pl-4">
              {monthJobs.map(job => (
                <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Building2 size={14} /> {job.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`badge text-sm status-${job.status}`}>{job.status.replace(/_/g, ' ')}</span>
                    {job.date_applied && <p className="text-xs text-gray-400 mt-1"><Calendar size={12} className="inline mr-1" />{format(new Date(job.date_applied), 'MMM d')}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
