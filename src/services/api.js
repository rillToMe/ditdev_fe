import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
};

export const certificatesAPI = {
  getAll: () => api.get('/certificates'),
  getById: (id) => api.get(`/certificates/${id}`),
};

export const statsAPI = {
  getAll: () => api.get('/stats'),
  getByKey: (key) => api.get(`/stats/${key}`),
};

export const contactAPI = {
  send: (data) => api.post('/contact', data),
};
export default api;
