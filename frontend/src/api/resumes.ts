import client from './client'

export interface Resume {
  id: string
  user_id: string
  name: string
  version: number
  file_path?: string
  file_type?: string
  extracted_text?: string
  created_at: string
  updated_at: string
}

export const resumesApi = {
  list: () => client.get<Resume[]>('/resumes/'),
  get: (id: string) => client.get<Resume>(`/resumes/${id}`),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<Resume>('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  download: (id: string) => client.get(`/resumes/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => client.delete(`/resumes/${id}`),
}
