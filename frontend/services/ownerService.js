import api from './api';

export const ownerService = {
  getMyListings: async () => {
    return await api.get('/owner/listings');
  },
  createListing: async (data) => {
    return await api.post('/owner/listings', data);
  },
  updateListing: async (id, data) => {
    return await api.patch(`/owner/listings/${id}`, data);
  },
  uploadPhotos: async (id, formData) => {
    return await api.post(`/owner/listings/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteListing: async (id) => {
    return await api.delete(`/owner/listings/${id}`);
  },
  getOwnerInterests: async (params = {}) => {
    return await api.get('/interests/owner', { params });
  },
  acceptInterest: async (id) => {
    return await api.patch(`/interests/${id}/accept`);
  },
  rejectInterest: async (id) => {
    return await api.patch(`/interests/${id}/reject`);
  },
};
