import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, MapPin, Briefcase, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/api/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    location: '', job_title: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
            <Briefcase className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Start tracking your job applications with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name *</label>
              <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input name="full_name" value={form.full_name} onChange={handleChange} className="input-field pl-9" required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Phone</label>
              <div className="relative"><Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input name="phone" value={form.phone} onChange={handleChange} className="input-field pl-9" /></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email *</label>
            <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input name="email" type="email" value={form.email} onChange={handleChange} className="input-field pl-9" required /></div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className="input-field pl-9 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"><EyeOff size={16} /></button>
            </div>
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Location</label>
              <div className="relative"><MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input name="location" value={form.location} onChange={handleChange} className="input-field pl-9" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Job Title</label>
              <div className="relative"><Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input name="job_title" value={form.job_title} onChange={handleChange} className="input-field pl-9" /></div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : null}
            Create Account
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
