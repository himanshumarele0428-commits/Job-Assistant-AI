import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, MapPin, ExternalLink, DollarSign, Sparkles } from 'lucide-react'
import client from '@/api/client'

interface JobResult {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary?: string
}

export default function JobSearchPage() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState('')
  const [remote, setRemote] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<JobResult[]>([])
  const [suggestions, setSuggestions] = useState<JobResult[]>([])
  const [error, setError] = useState('')

  const handleSearch = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await client.get('/search/jobs', {
        params: { title: title || undefined, location: location || undefined, skills: skills || undefined, remote }
      })
      setResults(data.items || [])
      if (!data.items?.length) setError('No results found or API not configured (set ADZUNA credentials)')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestions = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await client.get('/search/suggestions')
      setSuggestions(data.items || [])
      setResults(data.items || [])
      if (!data.items?.length) setError('No suggestions. Try uploading a resume first.')
    } catch {
      setError('Suggestions not available')
    } finally { setLoading(false) }
  }

  const displayResults = results.length > 0 ? results : suggestions

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Job Search</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Find jobs from external sources</p>

      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field pl-9" placeholder="Job title" />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={location} onChange={e => setLocation(e.target.value)} className="input-field pl-9" placeholder="Location" />
          </div>
          <div className="relative">
            <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={skills} onChange={e => setSkills(e.target.value)} className="input-field pl-9" placeholder="Skills" />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} className="rounded" /> Remote
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={18} />}
            Search
          </button>
          <button onClick={handleSuggestions} disabled={loading} className="btn-outline flex items-center gap-2">
            <Sparkles size={18} /> AI Suggestions
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-amber-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayResults.map((job, i) => (
          <motion.div key={job.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Building2 size={14} /> {job.company}</p>
              </div>
            </div>
            {job.location && <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin size={12} /> {job.location}</p>}
            {job.salary && <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><DollarSign size={12} /> {job.salary}</p>}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{job.description?.slice(0, 200)}</p>
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View Job <ExternalLink size={14} />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
