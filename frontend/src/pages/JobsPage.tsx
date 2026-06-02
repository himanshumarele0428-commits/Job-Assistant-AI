import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, ChevronDown, Edit3, Trash2, Building2, MapPin, Calendar, MoreHorizontal, Briefcase } from 'lucide-react'
import { jobsApi, Job, JobListResponse } from '@/api/jobs'
import { format } from 'date-fns'
import clsx from 'clsx'
import JobForm from '@/components/jobs/JobForm'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', applied: 'Applied', in_progress: 'In Progress',
  interview_scheduled: 'Interview', technical_round: 'Technical Round',
  hr_round: 'HR Round', selected: 'Selected',
  offer_received: 'Offer', rejected: 'Rejected', done: 'Done',
}

export default function JobsPage() {
  const [data, setData] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)

  const fetchJobs = () => {
    setLoading(true)
    jobsApi.list({ search: search || undefined, status: statusFilter || undefined, page })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchJobs() }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return
    await jobsApi.delete(id)
    fetchJobs()
  }

  const handleEdit = (job: Job) => { setEditing(job); setShowForm(true) }

  const handleCreate = () => { setEditing(null); setShowForm(true) }

  const handleStatusUpdate = async (job: Job, newStatus: string) => {
    await jobsApi.update(job.id, { status: newStatus })
    fetchJobs()
  }

  const onFormClose = () => { setShowForm(false); setEditing(null); fetchJobs() }

  const statuses = ['draft', 'applied', 'in_progress', 'interview_scheduled', 'technical_round', 'hr_round', 'selected', 'offer_received', 'rejected', 'done']

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{data?.total || 0} applications tracked</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search jobs or companies..." />
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-44">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {data?.items.map((job) => (
              <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 size={14} /> {job.company}
                    </p>
                  </div>
                  <div className="relative group">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><MoreHorizontal size={16} /></button>
                    <div className="absolute right-0 top-8 glass-card p-1.5 hidden group-hover:flex flex-col z-10 shadow-xl min-w-32">
                      <button onClick={() => handleEdit(job)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {job.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin size={12} /> {job.location}</p>
                )}
                {job.date_applied && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><Calendar size={12} /> {format(new Date(job.date_applied), 'MMM d, yyyy')}</p>
                )}

                <select
                  value={job.status}
                  onChange={(e) => handleStatusUpdate(job, e.target.value)}
                  className={clsx('badge cursor-pointer w-full mt-2 text-center border', `status-${job.status}`)}
                >
                  {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </motion.div>
            ))}
          </AnimatePresence>
          {data?.items.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Briefcase className="mx-auto mb-3" size={40} />
              <p>No jobs found. Add your first application!</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > data.page_size && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm">Previous</button>
          <span className="text-sm text-gray-500">Page {data.page} of {Math.ceil(data.total / data.page_size)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total / data.page_size)} className="btn-outline text-sm">Next</button>
        </div>
      )}

      {/* Slide-over Form */}
      <AnimatePresence>
        {showForm && <JobForm job={editing} onClose={onFormClose} />}
      </AnimatePresence>
    </div>
  )
}
