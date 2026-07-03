import api from './api';

export const listingService = {
  getPublicListings: async (params = {}) => {
    return await api.get('/listings', { params });
  },
  getListingById: async (id) => {
    return await api.get(`/listings/${id}`);
  },
  searchListings: async (params = {}) => {
    return await api.get('/search', { params });
  },
};
