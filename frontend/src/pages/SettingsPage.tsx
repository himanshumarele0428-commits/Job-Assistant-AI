import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Save, CheckCircle2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setApiKey } from '@/store/authSlice'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { apiKey } = useSelector((s: RootState) => s.auth)
  const [localKey, setLocalKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    dispatch(setApiKey(localKey))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Configure your account and API keys</p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-6">
        {/* API Key */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Groq API Key</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Required for ATS analysis and cover letter generation. Get your key at{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">console.groq.com</a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={localKey}
              onChange={e => setLocalKey(e.target.value)}
              className="input-field flex-1"
              placeholder="gsk_..."
            />
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              {saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Save</>}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Settings size={18} className="text-primary-600" /> Appearance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Dark mode can be toggled from the header.</p>
        </div>
      </motion.div>
    </div>
  )
}
