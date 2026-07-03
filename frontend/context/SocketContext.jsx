'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket } from '../lib/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      const sock = initSocket();
      if (sock) {
        setSocket(sock);

        sock.on('userStatusChanged', ({ userId, isOnline }) => {
          setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
        });

        sock.on('newNotification', (notif) => {
          setUnreadNotificationsCount(prev => prev + 1);
        });

        return () => {
          sock.off('userStatusChanged');
          sock.off('newNotification');
        };
      }
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, unreadNotificationsCount, setUnreadNotificationsCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
