import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

let socket = null;

export const initSocket = (token) => {
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  if (!socket && token) {
    socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return initSocket(token);
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
