import api from './api';

export const tenantService = {
  getPreferences: async () => {
    return await api.get('/tenant/preferences');
  },
  updatePreferences: async (data) => {
    return await api.patch('/tenant/preferences', data);
  },
  getFavorites: async () => {
    return await api.get('/tenant/favorites');
  },
  addFavorite: async (listingId) => {
    return await api.post(`/tenant/favorites/${listingId}`);
  },
  removeFavorite: async (listingId) => {
    return await api.delete(`/tenant/favorites/${listingId}`);
  },
  sendInterest: async (listingId, message = '') => {
    return await api.post(`/interests/${listingId}`, { message });
  },
  getTenantInterests: async () => {
    return await api.get('/interests/tenant');
  },
  cancelInterest: async (id) => {
    return await api.delete(`/interests/${id}`);
  },
};
