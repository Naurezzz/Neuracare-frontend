import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ML Services API
export const mlServices = {
  // Eye Disease
  analyzeEyeImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/ml/eye-disease/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getEyeDiseaseInfo: () => api.get('/ml/eye-disease/info'),

  // Mental Health
  sendMentalHealthMessage: (message) =>
    api.post('/ml/mental-health/chat', { message }),
  
  classifyIntent: (text) =>
    api.post('/ml/mental-health/classify', { text }),
  
  // Public Health
  askHealthQuestion: (question) =>
    api.post('/ml/public-health/ask', { question }),
  
  getCovidStats: (country = 'India') =>
    api.get(`/ml/public-health/covid/${country}`),
  
  getHealthNews: (query = 'health India') =>
    api.get('/ml/public-health/news', { params: { query } }),

  // --- UPDATED multi-modal Cognitive Health ---
  analyzeCognitiveHealth: (formData) =>
    api.post('/ml/cognitive-health/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateCognitiveReport: (results, userName) =>
    api.post(
      '/ml/cognitive-health/generate-report',
      { results, userName },
      { responseType: 'blob' }
    ),

  // Legacy: Feature-based dyslexia (manual entry)
  analyzeDyslexia: (features) =>
    api.post('/ml/cognitive-health/dyslexia', features),

  // Health Check
  checkMLServicesHealth: () => api.get('/ml/health'),
};

export default api;
