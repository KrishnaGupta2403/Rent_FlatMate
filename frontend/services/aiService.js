import api from './api';

export const aiService = {
  getCompatibility: async (listingId) => {
    return await api.get(`/ai/compatibility/${listingId}`);
  },
  getSortedListings: async (params = {}) => {
    return await api.get('/ai/compatibility/sort/all', { params });
  },
  testToggleFail: async () => {
    return await api.post('/ai/compatibility/test-toggle-fail');
  },
};
