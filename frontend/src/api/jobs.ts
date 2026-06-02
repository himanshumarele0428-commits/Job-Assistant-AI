import client from './client'

export interface Job {
  id: string
  user_id: string
  title: string
  company: string
  company_website?: string
  location?: string
  employment_type?: string
  work_mode?: string
  salary_range?: string
  experience_required?: string
  description?: string
  skills_required?: string[]
  application_url?: string
  resume_id?: string
  cover_letter_id?: string
  status: string
  date_applied?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  total: number
  page: number
  page_size: number
  items: Job[]
}

export interface JobFilters {
  status?: string
  search?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: string
}

export const jobsApi = {
  list: (filters?: JobFilters) =>
    client.get<JobListResponse>('/jobs/', { params: filters }),
  get: (id: string) => client.get<Job>(`/jobs/${id}`),
  create: (data: Partial<Job>) => client.post<Job>('/jobs/', data),
  update: (id: string, data: Partial<Job>) => client.put<Job>(`/jobs/${id}`, data),
  delete: (id: string) => client.delete(`/jobs/${id}`),
  statusCounts: () => client.get<Record<string, number>>('/jobs/stats/status-counts'),
}
