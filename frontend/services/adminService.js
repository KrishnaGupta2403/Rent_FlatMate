import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },
  listUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },
  blockUser: async (id) => {
    return await api.patch(`/admin/users/${id}/block`);
  },
  unblockUser: async (id) => {
    return await api.patch(`/admin/users/${id}/unblock`);
  },
  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },
  listListings: async (params = {}) => {
    return await api.get('/admin/listings', { params });
  },
  deleteListing: async (id) => {
    return await api.delete(`/admin/listings/${id}`);
  },
  markSpam: async (id) => {
    return await api.patch(`/admin/listings/${id}/spam`);
  },
};
