import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, FileText, Download, Building2, User, Trash2, Sparkles, Eye } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { resumesApi, Resume } from '@/api/resumes'
import { coverLetterApi, CoverLetter } from '@/api/coverLetter'

export default function CoverLetterPage() {
  const { apiKey } = useSelector((s: RootState) => s.auth)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [letters, setLetters] = useState<CoverLetter[]>([])
  const [selectedResume, setSelectedResume] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [hiringManager, setHiringManager] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<CoverLetter | null>(null)
  const [previewLetter, setPreviewLetter] = useState<CoverLetter | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { resumesApi.list().then(r => setResumes(r.data)) }, [])
  useEffect(() => { coverLetterApi.list().then(r => setLetters(r.data)) }, [])

  const handleGenerate = async () => {
    if (!selectedResume || !jdText.trim() || !companyName) {
      setError('Please fill all required fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await coverLetterApi.generate(selectedResume, jdText, companyName, apiKey, hiringManager || undefined)
      setGenerated(data)
      coverLetterApi.list().then(r => setLetters(r.data))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (id: string) => {
    const res = await coverLetterApi.downloadPdf(id)
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a'); a.href = url; a.download = `cover_letter.pdf`; a.click(); URL.revokeObjectURL(url)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return
    await coverLetterApi.delete(id)
    setLetters(letters.filter(l => l.id !== id))
  }

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Cover Letter Generator</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">AI-generated, ATS-friendly cover letters</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Resume *</label>
            <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)} className="input-field">
              <option value="">Select resume</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Name *</label>
            <div className="relative"><Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field pl-9" placeholder="Acme Inc." /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Hiring Manager (optional)</label>
            <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input value={hiringManager} onChange={e => setHiringManager(e.target.value)} className="input-field pl-9" placeholder="John Doe" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Job Description *</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} className="input-field h-40 resize-none" placeholder="Paste the job description..." />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={18} />}
            Generate Cover Letter
          </button>
        </div>

        {/* Output */}
        <div>
          {generated && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><FileText size={18} /> Generated Letter</h3>
                <button onClick={() => handleDownloadPdf(generated.id)} className="btn-primary text-sm flex items-center gap-1.5"><Download size={14} /> PDF</button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                {generated.content}
              </pre>
            </motion.div>
          )}

          {/* Past Letters */}
          {letters.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Past Cover Letters</h3>
              <div className="space-y-2">
                {letters.map(l => (
                  <div key={l.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{l.company_name}</p>
                      <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setPreviewLetter(l)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye size={14} /></button>
                      <button onClick={() => handleDownloadPdf(l.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Download size={14} /></button>
                      <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLetter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreviewLetter(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-1">{previewLetter.company_name}</h3>
              {previewLetter.hiring_manager && <p className="text-sm text-gray-400 mb-3">To: {previewLetter.hiring_manager}</p>}
              <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">{previewLetter.content}</pre>
              <button onClick={() => setPreviewLetter(null)} className="btn-outline w-full mt-4">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
