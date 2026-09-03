import type {
  Admin,
  ApiResponse,
  AuthResponse,
  Certificate,
  CertificateInput,
  LoginCredentials,
  Project,
  ProjectInput,
  RagStatusResponse,
  Stat,
  StatInput,
  UploadResponse,
} from '../../types/api'

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface ApiRequestOptions {
  method?: string
  body?: string
  headers?: Record<string, string>
  skipAuth?: boolean
}

const api = {
  async request<T = ApiResponse>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const token = localStorage.getItem('admin_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data as T
  },

  // Auth
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    })
  },

  register(credentials: LoginCredentials): Promise<ApiResponse<Admin>> {
    return this.request<ApiResponse<Admin>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  },

  verify(): Promise<{ success: boolean; admin: Admin }> {
    return this.request<{ success: boolean; admin: Admin }>('/auth/verify')
  },

  // Projects
  getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<ApiResponse<Project[]>>('/projects', { skipAuth: true })
  },

  getProject(id: number): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/projects/${id}`, { skipAuth: true })
  },

  createProject(data: ProjectInput): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateProject(id: number, data: ProjectInput): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteProject(id: number): Promise<ApiResponse> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  // Certificates
  getCertificates(): Promise<ApiResponse<Certificate[]>> {
    return this.request<ApiResponse<Certificate[]>>('/certificates', { skipAuth: true })
  },

  getCertificate(id: number): Promise<ApiResponse<Certificate>> {
    return this.request<ApiResponse<Certificate>>(`/certificates/${id}`, { skipAuth: true })
  },

  createCertificate(data: CertificateInput): Promise<ApiResponse<Certificate>> {
    return this.request<ApiResponse<Certificate>>('/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateCertificate(id: number, data: CertificateInput): Promise<ApiResponse<Certificate>> {
    return this.request<ApiResponse<Certificate>>(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteCertificate(id: number): Promise<ApiResponse> {
    return this.request(`/certificates/${id}`, {
      method: 'DELETE',
    })
  },

  // Upload
  async uploadImage(file: File, type = 'projects'): Promise<UploadResponse> {
    const token = localStorage.getItem('admin_token')
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed')
    }

    return data as UploadResponse
  },

  deleteImage(filename: string, type = 'projects'): Promise<ApiResponse> {
    return this.request(`/upload/${filename}?type=${type}`, {
      method: 'DELETE',
    })
  },

  // Upload PDF
  async uploadPDF(file: File): Promise<UploadResponse> {
    const token = localStorage.getItem('admin_token')
    const formData = new FormData()
    formData.append('pdf', file)

    const response = await fetch(`${API_URL}/upload/pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Upload PDF failed')
    }

    return data as UploadResponse
  },

  // Stats
  getStats(): Promise<ApiResponse<Stat[]>> {
    return this.request<ApiResponse<Stat[]>>('/stats', { skipAuth: true })
  },

  getStatByKey(key: string): Promise<ApiResponse<Stat>> {
    return this.request<ApiResponse<Stat>>(`/stats/${key}`, { skipAuth: true })
  },

  createStat(data: StatInput): Promise<ApiResponse<Stat>> {
    return this.request<ApiResponse<Stat>>('/stats', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateStat(key: string, data: StatInput): Promise<ApiResponse<Stat>> {
    return this.request<ApiResponse<Stat>>(`/stats/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteStat(key: string): Promise<ApiResponse> {
    return this.request(`/stats/${key}`, {
      method: 'DELETE',
    })
  },

  // RAG index
  getRagStatus(): Promise<RagStatusResponse> {
    return this.request<RagStatusResponse>('/rag/status')
  },

  rebuildRag(): Promise<ApiResponse> {
    return this.request('/rag/rebuild', {
      method: 'POST',
    })
  },
}

export default api

// Helper untuk get image URL
export const getImageUrl = (path?: string | null): string | null => {
  if (!path) return null
  // If already a full URL (Supabase or any CDN), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Legacy local uploads (fallback)
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${baseUrl}${path}`
}