import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Download, Trash2, Eye, Clock } from 'lucide-react'
import { resumesApi, Resume } from '@/api/resumes'
import { format } from 'date-fns'

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Resume | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchResumes = () => {
    setLoading(true)
    resumesApi.list().then(r => setResumes(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchResumes() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      await resumesApi.upload(file)
      fetchResumes()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDownload = async (id: string, name: string) => {
    const res = await resumesApi.download(id)
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return
    await resumesApi.delete(id)
    fetchResumes()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your resume versions</p>
        </div>
      </div>

      {/* Upload Area */}
      <label className="glass-card p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary-400 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600 mb-6">
        {uploading ? (
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        ) : (
          <>
            <Upload size={36} className="text-primary-600" />
            <p className="font-medium text-gray-700 dark:text-gray-300">Drop resume or click to upload</p>
            <p className="text-xs text-gray-400">PDF or DOCX up to 20MB</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleUpload} className="hidden" />
      </label>

      {/* Resume List */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {resumes.map(resume => (
              <motion.div key={resume.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                    <FileText className="text-primary-600" size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{resume.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(resume.created_at), 'MMM d, yyyy')}</span>
                      <span>v{resume.version}</span>
                      <span className="uppercase">{resume.file_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreview(resume)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => handleDownload(resume.id, resume.name)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Download"><Download size={16} /></button>
                  <button onClick={() => handleDelete(resume.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-2">{preview.name}</h3>
              <p className="text-sm text-gray-400 mb-4">Version {preview.version} · {preview.file_type?.toUpperCase()}</p>
              <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                {preview.extracted_text || 'No text extracted'}
              </pre>
              <button onClick={() => setPreview(null)} className="btn-outline w-full mt-4">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
