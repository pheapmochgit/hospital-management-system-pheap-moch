import axios from 'axios';
import { clearStoredUser } from '../utils/authSession';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ✅ FIXED: Added response interceptor for error handling
 * - Logs errors for debugging
 * - Handles 401 (Unauthorized) by logging out user
 * - Provides better error feedback to frontend
 */
api.interceptors.response.use(
  (response) => {
    // ✅ FIXED: Log successful responses (optional, for debugging)
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    // ❌ Handle errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);

      // ✅ FIXED: Handle 401 (Unauthorized) - user session expired
      if (error.response.status === 401) {
        console.warn('Unauthorized access - clearing user data');
        clearStoredUser();
        window.location.href = '/login'; // Redirect to login
      }

      // ✅ FIXED: Handle 403 (Forbidden) - user doesn't have permission
      if (error.response.status === 403) {
        console.error('Access Forbidden');
      }

      // ✅ FIXED: Handle 500 (Server Error)
      if (error.response.status === 500) {
        console.error('Server Error - Please try again later');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getUser: (id) => api.get(`/auth/user/${id}`),
  getCount: () => api.get('/auth/count'),
  resetData: () => api.post('/auth/reset'),
  updateUser: (id, userData) => api.put(`/auth/user/${id}`, userData),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getCount: () => api.get('/departments/count'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Doctor APIs
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getByUserId: (userId) => api.get(`/doctors/user/${userId}`),
  getCount: () => api.get('/doctors/count'),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// Patient APIs
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  getCount: () => api.get('/patients/count'),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getByUserId: (userId) => api.get(`/patients/user/${userId}`),
};

// Appointment APIs
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getCount: () => api.get('/appointments/count'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
};

// Report APIs
export const reportAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  getCount: () => api.get('/reports/count'),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/reports/doctor/${doctorId}`),
};

export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getCount: () => api.get('/prescriptions/count'),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/prescriptions/doctor/${doctorId}`),
};

export default api;