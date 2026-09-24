import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  maxContentLength: 100 * 1024 * 1024,
  maxBodyLength: 100 * 1024 * 1024,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ إذا كانت البيانات FormData، احذف Content-Type نهائياً
    // ليضبط axios الحدود (boundary) تلقائياً
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.includes('/admin') || url.includes('/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================
 *  AUTH
 * ============================================================ */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/* ============================================================
 *  NEWS
 *  ⚠️ لا تضبط Content-Type يدوياً مع FormData
 * ============================================================ */
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  getBreaking: (limit = 5) => api.get('/news/breaking', { params: { limit } }),
  getFeatured: (limit = 5) => api.get('/news/featured', { params: { limit } }),
  getPopular: (limit = 5) => api.get('/news/popular', { params: { limit } }),
  getStats: () => api.get('/news/stats'),

  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
};

/* ============================================================
 *  VIDEOS
 * ============================================================ */
export const videoAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  getFeatured: (limit = 6) => api.get('/videos/featured', { params: { limit } }),

  create: (formData) => api.post('/videos', formData),
  update: (id, formData) => api.put(`/videos/${id}`, formData),
  delete: (id) => api.delete(`/videos/${id}`),
};

/* ============================================================
 *  PLAYERS
 * ============================================================ */
export const playerAPI = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  getByPosition: () => api.get('/players/by-position'),
  getStats: () => api.get('/players/stats'),

  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
};

/* ============================================================
 *  MATCHES  (JSON — لا FormData)
 * ============================================================ */
export const matchAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  getUpcoming: (limit = 5) => api.get('/matches/upcoming', { params: { limit } }),
  getFinished: (limit = 10) => api.get('/matches/finished', { params: { limit } }),
  getLive: () => api.get('/matches/live'),
  getStats: () => api.get('/matches/stats'),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  updateScore: (id, data) => api.patch(`/matches/${id}/score`, data),
  delete: (id) => api.delete(`/matches/${id}`),
};

/* ============================================================
 *  STATISTICS
 * ============================================================ */
export const statisticAPI = {
  getAll: (params) => api.get('/statistics', { params }),
  getById: (id) => api.get(`/statistics/${id}`),
  create: (data) => api.post('/statistics', data),
  update: (id, data) => api.put(`/statistics/${id}`, data),
  delete: (id) => api.delete(`/statistics/${id}`),
};

/* ============================================================
 *  MESSAGES
 * ============================================================ */
export const messageAPI = {
  create: (data) => api.post('/messages', data),
  getMy: () => api.get('/messages/my'),
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  updateStatus: (id, data) => api.put(`/messages/${id}/status`, data),
  delete: (id) => api.delete(`/messages/${id}`),
};

/* ============================================================
 *  NOTIFICATIONS
 * ============================================================ */
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

export default api;