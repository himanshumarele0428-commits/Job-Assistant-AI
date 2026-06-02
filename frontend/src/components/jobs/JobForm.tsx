import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { jobsApi, Job } from '@/api/jobs'

interface Props {
  job: Job | null
  onClose: () => void
}

const STATUS_OPTIONS = [
  'draft', 'applied', 'in_progress', 'interview_scheduled',
  'technical_round', 'hr_round', 'selected', 'offer_received', 'rejected', 'done',
]

export default function JobForm({ job, onClose }: Props) {
  const [form, setForm] = useState({
    title: '', company: '', company_website: '', location: '',
    employment_type: '', work_mode: '', salary_range: '',
    experience_required: '', description: '', skills_required: [] as string[],
    application_url: '', status: 'draft', date_applied: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title, company: job.company, company_website: job.company_website || '',
        location: job.location || '', employment_type: job.employment_type || '',
        work_mode: job.work_mode || '', salary_range: job.salary_range || '',
        experience_required: job.experience_required || '', description: job.description || '',
        skills_required: job.skills_required || [], application_url: job.application_url || '',
        status: job.status, date_applied: job.date_applied || '', notes: job.notes || '',
      })
      setSkillsInput((job.skills_required || []).join(', '))
    }
  }, [job])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addSkill = () => {
    const skill = skillsInput.split(',').pop()?.trim()
    if (skill && !form.skills_required.includes(skill)) {
      setForm({ ...form, skills_required: [...form.skills_required, skill] })
      setSkillsInput('')
    }
  }

  const removeSkill = (s: string) => {
    setForm({ ...form, skills_required: form.skills_required.filter(x => x !== s) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (job) {
        await jobsApi.update(job.id, form)
      } else {
        await jobsApi.create(form)
      }
      onClose()
    } catch {
      setError('Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        className="w-full max-w-xl h-full overflow-y-auto glass-card rounded-none border-0 shadow-2xl"
      >
        <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {job ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Job Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Company *</label>
              <input name="company" value={form.company} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Work Mode</label>
              <select name="work_mode" value={form.work_mode} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Employment Type</label>
              <select name="employment_type" value={form.employment_type} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Salary Range</label>
              <input name="salary_range" value={form.salary_range} onChange={handleChange} className="input-field" placeholder="e.g. $80k - $120k" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Application URL</label>
            <input name="application_url" value={form.application_url} onChange={handleChange} className="input-field" placeholder="https://" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Skills Required</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.skills_required.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1" placeholder="Type skill and press Enter"
              />
              <button type="button" onClick={addSkill} className="btn-outline">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Job Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field h-24 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Date Applied</label>
              <input name="date_applied" type="date" value={form.date_applied} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Experience Required</label>
            <input name="experience_required" value={form.experience_required} onChange={handleChange} className="input-field" placeholder="e.g. 3+ years" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field h-20 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
