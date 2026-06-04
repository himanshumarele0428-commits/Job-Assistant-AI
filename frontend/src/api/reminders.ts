import client from './client'

export interface Reminder {
  id: string
  user_id: string
  job_id?: string
  title: string
  reminder_type: string
  scheduled_at: string
  is_sent: boolean
  notification_type: string
  recipient_email?: string
  created_at: string
}

export const remindersApi = {
  list: () => client.get<Reminder[]>('/reminders/'),
  create: (data: Partial<Reminder>) => client.post<Reminder>('/reminders/', data),
  update: (id: string, data: Partial<Reminder>) => client.put<Reminder>(`/reminders/${id}`, data),
  delete: (id: string) => client.delete(`/reminders/${id}`),
}
