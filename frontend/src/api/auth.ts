import client from './client'

export interface LoginPayload {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterPayload {
  full_name: string
  email: string
  phone?: string
  password: string
  location?: string
  job_title?: string
}

export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  linkedin_url?: string
  location?: string
  job_title?: string
  role: string
  is_active: boolean
  created_at: string
}

export const authApi = {
  register: (data: RegisterPayload) => client.post<User>('/auth/register', data),
  login: (data: LoginPayload) =>
    client.post<{ access_token: string; refresh_token: string }>('/auth/login', data),
  me: () => client.get<User>('/auth/me'),
  refresh: (refresh_token: string) =>
    client.post('/auth/refresh', { refresh_token }),
  logout: () => client.post('/auth/logout'),
  forgotPassword: (email: string) => client.post('/auth/forgot-password', { email }),
}
