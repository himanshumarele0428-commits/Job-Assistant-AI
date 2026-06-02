import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Search, FileText, Target, Shield, Sparkles, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { resumesApi, Resume } from '@/api/resumes'
import { atsApi, ATSAnalysis } from '@/api/ats'
import clsx from 'clsx'

function getScoreColor(score: number) {
  if (score >= 7) return 'text-green-500'
  if (score >= 4) return 'text-amber-500'
  return 'text-red-500'
}

export default function ATSCheckerPage() {
  const { apiKey } = useSelector((s: RootState) => s.auth)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ATSAnalysis | null>(null)
  const [history, setHistory] = useState<ATSAnalysis[]>([])
  const [error, setError] = useState('')

  useEffect(() => { resumesApi.list().then(r => setResumes(r.data)) }, [])
  useEffect(() => { atsApi.history().then(r => setHistory(r.data)) }, [])

  const handleAnalyze = async () => {
    if (!selectedResume || !jdText.trim() || !apiKey) {
      setError('Please select a resume, enter a job description, and provide your API key')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await atsApi.analyze(selectedResume, jdText, apiKey)
      setResult(data)
      atsApi.history().then(r => setHistory(r.data))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = (analysis: ATSAnalysis) => {
    setResult(analysis)
    setJdText(analysis.jd_text || '')
  }

  const scores = result?.scores || {}
  const keywords = result?.keyword_analysis
  const feedback = result?.detailed_feedback

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">ATS Resume Checker</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Analyze your resume against job descriptions</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Select Resume</label>
            <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)} className="input-field">
              <option value="">Choose a resume</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.name} (v{r.version})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Job Description</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} className="input-field h-48 resize-none" placeholder="Paste the job description here..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Groq API Key</label>
            <input type="password" value={apiKey} readOnly className="input-field bg-gray-50 dark:bg-gray-900" placeholder="Set in Settings" />
          </div>
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}
          <button onClick={handleAnalyze} disabled={loading || !apiKey} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={18} />}
            Analyze Resume
          </button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full" />
                <p className="text-gray-500">AI is analyzing your resume...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Overall Score */}
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-gray-400 mb-2">Overall ATS Score</p>
                  <p className={clsx('text-6xl font-extrabold', getScoreColor(result.overall_score || 0))}>
                    {result.overall_score?.toFixed(1) || '—'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">/ 10</p>
                </div>

                {/* Dimension Scores */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Target size={18} /> Dimension Scores</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(scores).map(([key, val]: [string, any]) => (
                      <div key={key} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-xs text-gray-400 capitalize">{val.label || key.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className={clsx('h-full rounded-full transition-all', getScoreColor(Number(val.score)))} style={{ width: `${Number(val.score) * 10}%` }} />
                          </div>
                          <span className={clsx('text-lg font-bold', getScoreColor(Number(val.score)))}>{val.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    ATS Readability: <span className="font-bold text-gray-700 dark:text-gray-300">{result.ats_readability_score?.toFixed(1)}/100</span>
                  </p>
                </div>

                {/* Keyword Analysis */}
                {keywords && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles size={18} /> Keywords ({keywords.match_percentage}% match)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> Matched</p>
                        <div className="flex flex-wrap gap-1.5">
                          {keywords.matched_keywords.map(k => <span key={k} className="px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">{k}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Missing</p>
                        <div className="flex flex-wrap gap-1.5">
                          {keywords.missing_keywords.map(k => <span key={k} className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">{k}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {feedback && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb size={18} /> Feedback</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">Strengths</p>
                        {feedback.strengths.map((s, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-400 ml-2">{s}</p>)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-600 mb-1">Improvements</p>
                        {feedback.improvements.map((s, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-400 ml-2">{s}</p>)}
                      </div>
                    </div>
                  </div>
                )}

                {result.summary && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText size={18} /> Summary</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && !result && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Past Analyses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 6).map(h => (
              <motion.button key={h.id} onClick={() => loadHistory(h)} whileHover={{ scale: 1.02 }} className="glass-card p-4 text-left hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{h.summary?.slice(0, 40) || 'Analysis'}</span>
                  <span className={clsx('text-lg font-bold', getScoreColor(h.overall_score || 0))}>{h.overall_score?.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleDateString()}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
