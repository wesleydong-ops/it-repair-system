import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = user.role
      localStorage.removeItem('user')
      if (role === 'engineer') {
        window.location.href = '/engineer/login'
      } else if (role === 'purchaser') {
        window.location.href = '/purchaser/login'
      } else {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  username: string
  name: string
  role: string
  area?: string
  isActive: boolean
  createTime: string
}

export interface EngineerGroup {
  id: string
  name: string
  area: string
  description: string
  isActive: boolean
  members: User[]
}

export interface RepairProject {
  id: string
  name: string
  category: string
  description: string
  isActive: boolean
  sortOrder: number
}

export interface WorkOrder {
  id: string
  orderNo: string
  applicantName: string
  department: string
  location: string
  extension: string
  email: string
  webexId: string
  assetNo: string
  deviceType: string
  deviceLocation: string
  projectId: string
  projectName: string
  description: string
  repairType: 'internal' | 'remote'
  notificationChannels: ('extension' | 'email' | 'webex')[]
  priority: 'normal' | 'urgent'
  status: 'pending' | 'accepted' | 'processing' | 'external_pending' | 'external_processing' | 'completed' | 'closed'
  area: string
  engineerId?: string
  engineerName?: string
  statusLog: string
  createTime: string
  updateTime: string
  externalReason?: string
  externalParts?: string
  externalCost?: number
  externalCompany?: string
  repairRecord?: string
  faultReason?: string
  solution?: string
}

export interface StatisticsResponse {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  averageDuration: number
  engineerStats: Array<{
    engineerId: string
    name: string
    acceptedCount: number
    completedCount: number
    avgDuration: number
  }>
  areaStats: Array<{
    area: string
    orderCount: number
    completionRate: number
  }>
}

export interface SystemConfig {
  id: string
  configKey: string
  configValue: string
  description: string
}

export const workOrderApi = {
  submit: (data: Omit<WorkOrder, 'id' | 'orderNo' | 'status' | 'engineerId' | 'engineerName' | 'statusLog' | 'createTime' | 'updateTime' | 'projectName'>) =>
    api.post('/workorder/submit', data),
  
  list: (params: { status?: string; area?: string; engineerId?: string; page?: number; size?: number }) =>
    api.get('/workorder/list', { params }),
  
  detail: (id: string) =>
    api.get(`/workorder/${id}`),
  
  accept: (id: string) =>
    api.post(`/workorder/${id}/accept`),
  
  startProcess: (id: string) =>
    api.post(`/workorder/${id}/start`),
  
  complete: (id: string, data: { repairRecord: string; faultReason: string; solution: string }) =>
    api.post(`/workorder/${id}/complete`, data),
  
  close: (id: string) =>
    api.post(`/workorder/${id}/close`),
  
  createExternalRepair: (id: string, data: { reason: string; parts: string; estimatedCost: number; repairCompany: string }) =>
    api.post(`/workorder/${id}/external`, data),
  
  startExternal: (id: string) =>
    api.post(`/workorder/${id}/external/start`),
  
  completeExternalRepair: (id: string, data: { repairRecord: string; faultReason: string; solution: string; actualCost?: number }) =>
    api.post(`/workorder/${id}/external/complete`, data),
  
  rejectExternal: (id: string, reason: string) =>
    api.post(`/workorder/${id}/external/reject`, { reason })
}

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/admin/login', data),
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  getCurrentUser: () =>
    api.get('/admin/me')
}

export const userApi = {
  list: () =>
    api.get('/admin/users'),
  
  create: (data: Omit<User, 'id' | 'createTime'>) =>
    api.post('/admin/users', data),
  
  update: (id: string, data: Partial<User>) =>
    api.put(`/admin/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/users/${id}`)
}

export const groupApi = {
  list: () =>
    api.get('/admin/groups'),
  
  create: (data: Omit<EngineerGroup, 'id' | 'members'>) =>
    api.post('/admin/groups', data),
  
  update: (id: string, data: Partial<EngineerGroup>) =>
    api.put(`/admin/groups/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/groups/${id}`),
  
  addMember: (groupId: string, userId: string) =>
    api.post(`/admin/groups/${groupId}/members`, { userId }),
  
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/admin/groups/${groupId}/members/${userId}`)
}

export const projectApi = {
  list: () =>
    api.get('/admin/projects'),
  
  create: (data: Omit<RepairProject, 'id'>) =>
    api.post('/admin/projects', data),
  
  update: (id: string, data: Partial<RepairProject>) =>
    api.put(`/admin/projects/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/projects/${id}`)
}

export const statisticsApi = {
  get: (params?: { startTime?: string; endTime?: string; department?: string; area?: string }) =>
    api.get('/admin/statistics', { params })
}

export interface SettingsData {
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  smtpSecure: boolean
  webexToken: string
  webexRoomId: string
  extensionServer: string
  extensionPort: number
  systemUrl: string
  httpsPort?: number
  certPath?: string
  certPassword?: string
  certFileName?: string
  chainFileName?: string
  keyFileName?: string
  notifications?: {
    orderSubmit: boolean
    orderAccept: boolean
    orderComplete: boolean
  }
}

export const adminApi = {
  getSettings: () =>
    api.get('/admin/settings'),
  
  updateSettings: (data: SettingsData) =>
    api.put('/admin/settings', data),
  
  testEmail: (email: string) =>
    api.post('/admin/settings/test-email', { testEmail: email })
}

export const settingsApi = {
  list: () =>
    api.get('/admin/settings'),
  
  update: (configs: Array<{ configKey: string; configValue: string }>) =>
    api.put('/admin/settings', { configs })
}

export default api
