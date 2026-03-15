const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2817/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  },

  // Auth
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },
  
  register(credentials) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  },
  
  verify() {
    return this.request('/auth/verify');
  },

  // Projects
  getProjects() {
    return this.request('/projects', { skipAuth: true });
  },

  getProject(id) {
    return this.request(`/projects/${id}`, { skipAuth: true });
  },

  createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Certificates
  getCertificates() {
    return this.request('/certificates', { skipAuth: true });
  },

  getCertificate(id) {
    return this.request(`/certificates/${id}`, { skipAuth: true });
  },

  createCertificate(data) {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCertificate(id, data) {
    return this.request(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCertificate(id) {
    return this.request(`/certificates/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload
  async uploadImage(file, type = 'projects') {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data;
  },

  deleteImage(filename, type = 'projects') {
    return this.request(`/upload/${filename}?type=${type}`, {
      method: 'DELETE',
    });
  },

  // Upload PDF
async uploadPDF(file) {
  const token = localStorage.getItem('admin_token');
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_URL}/upload/pdf`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload PDF failed');
    }
    
    return data;
  },

  // Stats
  getStats() {
    return this.request('/stats', { skipAuth: true });
  },

  getStatByKey(key) {
    return this.request(`/stats/${key}`, { skipAuth: true });
  },

  createStat(data) {
    return this.request('/stats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStat(key, data) {
    return this.request(`/stats/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStat(key) {
    return this.request(`/stats/${key}`, {
      method: 'DELETE',
    });
  },
};

export default api;

// Helper untuk get image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  // If already a full URL (Supabase or any CDN), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Legacy local uploads (fallback)
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};