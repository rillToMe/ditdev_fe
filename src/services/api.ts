import axios from 'axios'
import type {
  ApiResponse,
  Certificate,
  ContactMessage,
  Project,
  Stat,
} from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export const projectsAPI = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getById: (id: number) => api.get<ApiResponse<Project>>(`/projects/${id}`),
}

export const certificatesAPI = {
  getAll: () => api.get<ApiResponse<Certificate[]>>('/certificates'),
  getById: (id: number) => api.get<ApiResponse<Certificate>>(`/certificates/${id}`),
}

export const statsAPI = {
  getAll: () => api.get<ApiResponse<Stat[]>>('/stats'),
  getByKey: (key: string) => api.get<ApiResponse<Stat>>(`/stats/${key}`),
}

export const contactAPI = {
  send: (data: ContactMessage) => api.post<ApiResponse>('/contact', data),
}

export default api