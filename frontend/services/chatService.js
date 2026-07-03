import api from './api';

export const chatService = {
  createOrGetChat: async (data) => {
    return await api.post('/chats', data);
  },
  getUserChats: async () => {
    return await api.get('/chats');
  },
  getChatById: async (chatId) => {
    return await api.get(`/chats/${chatId}`);
  },
  getChatMessages: async (chatId, params = {}) => {
    return await api.get(`/chats/${chatId}/messages`, { params });
  },
  sendMessage: async (chatId, data) => {
    return await api.post(`/chats/${chatId}/messages`, data);
  },
  markAsRead: async (chatId) => {
    return await api.patch(`/chats/${chatId}/read`);
  },
};
