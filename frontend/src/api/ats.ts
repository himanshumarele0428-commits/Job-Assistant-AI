import client from './client'

export interface ATSAnalysis {
  id: string
  user_id: string
  resume_id: string
  job_id?: string
  overall_score?: number
  scores?: Record<string, { score: string; label: string }>
  keyword_analysis?: {
    matched_keywords: string[]
    missing_keywords: string[]
    match_percentage: string
  }
  detailed_feedback?: {
    strengths: string[]
    improvements: string[]
  }
  summary?: string
  ats_readability_score?: number
  created_at: string
}

export const atsApi = {
  analyze: (resume_id: string, jd_text: string, api_key: string, job_id?: string) =>
    client.post<ATSAnalysis>('/ats/analyze', { resume_id, jd_text, api_key, job_id }),
  history: (resume_id?: string) =>
    client.get<ATSAnalysis[]>('/ats/history', { params: resume_id ? { resume_id } : {} }),
  get: (id: string) => client.get<ATSAnalysis>(`/ats/${id}`),
}
