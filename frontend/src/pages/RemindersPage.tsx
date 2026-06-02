import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, Trash2, Calendar, Clock, Edit3 } from 'lucide-react'
import { remindersApi, Reminder } from '@/api/reminders'
import { format } from 'date-fns'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', reminder_type: 'follow-up', scheduled_at: '',
    notification_type: 'email' as 'email' | 'in-app',
  })

  const fetchReminders = () => {
    setLoading(true)
    remindersApi.list().then(r => setReminders(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchReminders() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await remindersApi.update(editing.id, form)
      } else {
        await remindersApi.create(form)
      }
      setShowForm(false)
      setEditing(null)
      setForm({ title: '', reminder_type: 'follow-up', scheduled_at: '', notification_type: 'email' })
      fetchReminders()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save reminder')
    }
  }

  const handleEdit = (r: Reminder) => {
    setEditing(r)
    setForm({
      title: r.title,
      reminder_type: r.reminder_type,
      scheduled_at: r.scheduled_at.slice(0, 16),
      notification_type: r.notification_type as 'email' | 'in-app',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return
    await remindersApi.delete(id)
    fetchReminders()
  }

  const isPast = (date: string) => new Date(date) < new Date()

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay on top of interviews and follow-ups</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ title: '', reminder_type: 'follow-up', scheduled_at: '', notification_type: 'email' }); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Reminder
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {reminders.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`glass-card p-5 ${r.is_sent ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${r.is_sent ? 'bg-gray-100 dark:bg-gray-700' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                      <Bell size={18} className={r.is_sent ? 'text-gray-400' : 'text-amber-600'} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{r.title}</p>
                      <span className={`badge text-xs mt-1 ${r.reminder_type === 'interview' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : r.reminder_type === 'deadline' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {r.reminder_type}
                      </span>
                    </div>
                  </div>
                  {!r.is_sent && (
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(r.scheduled_at), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(r.scheduled_at), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge text-xs ${r.notification_type === 'email' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'}`}>
                    {r.notification_type}
                  </span>
                  {r.is_sent && <span className="badge bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Sent</span>}
                  {!r.is_sent && isPast(r.scheduled_at) && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Overdue</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Reminder' : 'New Reminder'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select value={form.reminder_type} onChange={e => setForm({ ...form, reminder_type: e.target.value })} className="input-field">
                    <option value="interview">Interview</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date & Time</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Notification</label>
                  <select value={form.notification_type} onChange={e => setForm({ ...form, notification_type: e.target.value as any })} className="input-field">
                    <option value="email">Email</option>
                    <option value="in-app">In-App</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
