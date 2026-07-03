import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },
  register: async (data) => {
    return await api.post('/auth/register', data);
  },
  logout: async (refreshToken) => {
    return await api.post('/auth/logout', { refreshToken });
  },
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },
  resetPassword: async (data) => {
    return await api.post('/auth/reset-password', data);
  },
  getProfile: async () => {
    return await api.get('/users/profile');
  },
  updateProfile: async (data) => {
    return await api.put('/users/profile', data);
  },
};
