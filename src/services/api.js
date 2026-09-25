import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  maxContentLength: 100 * 1024 * 1024,
  maxBodyLength: 100 * 1024 * 1024,
  timeout: 600000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

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

export const videoAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  getFeatured: (limit = 6) => api.get('/videos/featured', { params: { limit } }),

  create: (formData) => api.post('/videos', formData),
  update: (id, formData) => api.put(`/videos/${id}`, formData),
  delete: (id) => api.delete(`/videos/${id}`),
};

export const playerAPI = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  getByPosition: () => api.get('/players/by-position'),
  getStats: () => api.get('/players/stats'),

  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
};

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

export const statisticAPI = {
  getAll: (params) => api.get('/statistics', { params }),
  getById: (id) => api.get(`/statistics/${id}`),
  create: (data) => api.post('/statistics', data),
  update: (id, data) => api.put(`/statistics/${id}`, data),
  delete: (id) => api.delete(`/statistics/${id}`),
};

export const messageAPI = {
  create: (data) => api.post('/messages', data),
  getMy: () => api.get('/messages/my'),
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  updateStatus: (id, data) => api.put(`/messages/${id}/status`, data),
  delete: (id) => api.delete(`/messages/${id}`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};
export const electionAPI = {
  searchMember: (data) => api.post('/elections/search', data),
  register: (data) => api.post('/elections/register', data),
  getPublicStats: () => api.get('/elections/public-stats'),

  getList: (params) => api.get('/elections/admin/list', { params }),
  getStats: () => api.get('/elections/admin/stats'),
  export: (queryString) =>
    api.get(`/elections/admin/export?${queryString}`, { responseType: 'blob' }),
  importMembers: (formData) => api.post('/elections/admin/import', formData),
  deleteAllMembers: () => api.delete('/elections/admin/members'),
  resetAttendance: () => api.delete('/elections/admin/attendance'),
  deleteAttendance: (id) => api.delete(`/elections/admin/attendance/${id}`),
};

export const egyptianLeagueAPI = {
  getStandings: (params) => api.get('/egyptian-league/standings', { params }),
  getOurTeam: () => api.get('/egyptian-league/our-team'),
  getMatches: (params) => api.get('/egyptian-league/matches', { params }),
  getUpcoming: (limit = 10) => api.get('/egyptian-league/matches/upcoming', { params: { limit } }),
  getLive: () => api.get('/egyptian-league/matches/live'),
  getFinished: (limit = 20) => api.get('/egyptian-league/matches/finished', { params: { limit } }),
  getOurMatches: (limit = 10) => api.get('/egyptian-league/matches/our-team', { params: { limit } }),
  getMatchById: (id) => api.get(`/egyptian-league/matches/${id}`),
  getMatchDetails: (id) => api.get(`/egyptian-league/matches/${id}/details`),
  getStats: () => api.get('/egyptian-league/stats'),

  triggerSync: (type = 'full') => api.get(`/egyptian-league/admin/sync?type=${type}`),
  getSyncLogs: (limit = 20) => api.get('/egyptian-league/admin/sync-logs', { params: { limit } }),
  getApiStatus: () => api.get('/egyptian-league/admin/api-status'),
  searchLeagues: (country = 'Egypt') => api.get('/egyptian-league/admin/search-leagues', { params: { country } }),
};

export const filgoalAPI = {
  getStandings: (params) => api.get('/filgoal/standings', { params }),
  getMatches: (params) => api.get('/filgoal/matches', { params }),
  getUpcoming: (limit = 10) => api.get('/filgoal/matches/upcoming', { params: { limit } }),
  getLive: () => api.get('/filgoal/matches/live'),
  getFinished: (limit = 20) => api.get('/filgoal/matches/finished', { params: { limit } }),
  getOurMatches: (limit = 10) => api.get('/filgoal/matches/our-team', { params: { limit } }),
  getMatchById: (id) => api.get(`/filgoal/matches/${id}`),
  getNews: (limit = 20) => api.get('/filgoal/news', { params: { limit } }),
  getStats: () => api.get('/filgoal/stats'),
  triggerSync: () => api.post('/filgoal/sync'),
  getSyncLogs: () => api.get('/filgoal/sync-logs'),
};
export default api;