import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Links API
export const linksAPI = {
  createLink: (linkData) => api.post('/links', linkData),
  getLinks: () => api.get('/links'),
  getLink: (id) => api.get(`/links/${id}`),
  updateLink: (id, linkData) => api.put(`/links/${id}`, linkData),
  deleteLink: (id) => api.delete(`/links/${id}`),
};

export default api;
