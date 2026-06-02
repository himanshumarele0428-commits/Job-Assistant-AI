import client from './client'

export interface CoverLetter {
  id: string
  user_id: string
  resume_id: string
  job_id?: string
  company_name: string
  hiring_manager?: string
  content?: string
  file_path_pdf?: string
  file_path_docx?: string
  created_at: string
  updated_at: string
}

export const coverLetterApi = {
  generate: (resume_id: string, jd_text: string, company_name: string, api_key: string, hiring_manager?: string, job_id?: string) =>
    client.post<CoverLetter>('/cover-letter/generate', { resume_id, jd_text, company_name, api_key, hiring_manager, job_id }),
  list: () => client.get<CoverLetter[]>('/cover-letter/'),
  get: (id: string) => client.get<CoverLetter>(`/cover-letter/${id}`),
  downloadPdf: (id: string) => client.get(`/cover-letter/${id}/download/pdf`, { responseType: 'blob' }),
  delete: (id: string) => client.delete(`/cover-letter/${id}`),
}
