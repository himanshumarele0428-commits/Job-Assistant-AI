import client from './client'

export interface DashboardStats {
  total_jobs: number
  by_status: Record<string, number>
  average_ats_score: number
  interviews: number
  offers: number
}

export interface MonthlyData {
  year: number
  data: { month: string; count: number }[]
}

export const dashboardApi = {
  stats: () => client.get<DashboardStats>('/dashboard/stats'),
  monthlyApps: (year?: number) =>
    client.get<MonthlyData>('/dashboard/charts/monthly', { params: year ? { year } : {} }),
  companies: () => client.get<{ company: string; count: number }[]>('/dashboard/charts/companies'),
  atsTrend: () => client.get<{ date: string; score: number }[]>('/dashboard/charts/ats-trend'),
  activity: () => client.get('/dashboard/activity'),
}
