import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('railgo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errCode = error.response?.data?.error_code;
      if (errCode === 'TOKEN_EXPIRED' || errCode === 'INVALID_TOKEN') {
        localStorage.removeItem('railgo_token');
        localStorage.removeItem('railgo_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// =====================
// AUTH APIs
// =====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// =====================
// TICKET APIs
// =====================
export const ticketAPI = {
  search: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
};

// =====================
// BOOKING APIs
// =====================
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getByCode: (code) => api.get(`/bookings/${code}`),
  cancel: (code) => api.put(`/bookings/${code}/cancel`),
};

// =====================
// PAYMENT APIs
// =====================
export const paymentAPI = {
  submit: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(k => {
      if (data[k] !== null && data[k] !== undefined) formData.append(k, data[k]);
    });
    return api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getStatus: (code) => api.get(`/payments/${code}`),
};

// =====================
// QA SANDBOX APIs
// =====================
export const qaAPI = {
  slowResponse: () => api.get('/qa/slow-response', { timeout: 10000 }),
  randomFail: () => api.get('/qa/random-fail'),
  sessionExpired: () => api.get('/qa/session-expired'),
  duplicateSubmit: () => api.post('/qa/duplicate-submit'),
};

export default api;
