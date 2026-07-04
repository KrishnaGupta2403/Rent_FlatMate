'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket } from '../lib/socket';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  const showToast = (message, title = 'Notification', type = 'info') => {
    setToast({ message, title, type });
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return timer;
  };

  useEffect(() => {
    let activeTimer = null;

    if (user && user.id) {
      // 1. Initialize Socket.IO connection
      const sock = initSocket();
      if (sock) {
        setSocket(sock);

        sock.on('userStatusChanged', ({ userId, isOnline }) => {
          setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
        });

        // Listen for real-time notifications
        sock.on('newNotification', (notif) => {
          setUnreadNotificationsCount(prev => prev + 1);
          
          let emoji = '🔔';
          if (notif.type === 'ACCEPTED') emoji = '🏆';
          if (notif.type === 'REJECTED') emoji = '❌';
          if (notif.type === 'INTEREST') emoji = '📬';

          if (activeTimer) clearTimeout(activeTimer);
          activeTimer = showToast(notif.message, `${emoji} ${notif.title}`, notif.type);
        });

        // Listen for real-time chat messages
        sock.on('receiveMessage', (newMsg) => {
          // If we receive a message, set the unread chat status to true
          setHasUnreadChats(true);
          
          // Check if we are currently on the chat page to decide if we should pop up a toast
          const isChatPage = window.location.pathname.includes('/chat');
          if (!isChatPage) {
            const senderName = newMsg.sender?.fullName || 'Someone';
            if (activeTimer) clearTimeout(activeTimer);
            activeTimer = showToast(
              `"${newMsg.message.length > 50 ? newMsg.message.substring(0, 50) + '...' : newMsg.message}"`,
              `💬 New message from ${senderName}`,
              'CHAT'
            );
          }
        });
      }

      // 2. Fetch notifications on login to show pop-ups for unread actions
      const checkUnreadNotifications = async () => {
        try {
          const res = await notificationService.getNotifications({ limit: 15 });
          if (res && res.notifications) {
            const list = res.notifications;
            const unread = list.filter(n => !n.isRead);
            setUnreadNotificationsCount(unread.length);

            // Prioritize popups on login for key actions
            if (user.role === 'TENANT') {
              // Find unread acceptance/rejections
              const keyNotif = unread.find(n => n.type === 'ACCEPTED' || n.type === 'REJECTED');
              if (keyNotif) {
                const emoji = keyNotif.type === 'ACCEPTED' ? '🏆' : '❌';
                if (activeTimer) clearTimeout(activeTimer);
                activeTimer = showToast(keyNotif.message, `${emoji} ${keyNotif.title}`, keyNotif.type);
              }
            } else if (user.role === 'OWNER') {
              // Find unread tenant interest requests
              const keyNotif = unread.find(n => n.type === 'INTEREST');
              if (keyNotif) {
                if (activeTimer) clearTimeout(activeTimer);
                activeTimer = showToast(keyNotif.message, `📬 ${keyNotif.title}`, keyNotif.type);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load initial notifications for popups:', err);
        }
      };

      // 3. Fetch user chats to determine if there are unread messages
      const checkUnreadChats = async () => {
        try {
          const res = await chatService.getUserChats();
          const list = res?.chats || (Array.isArray(res) ? res : []);
          
          // Check if any chat has a last message that is unread and not sent by current user
          const hasUnread = list.some(chat => {
            const lastMsg = chat.messages?.[0];
            return lastMsg && !lastMsg.isRead && lastMsg.senderId !== user.id;
          });
          setHasUnreadChats(hasUnread);
        } catch (err) {
          console.error('Failed to check for unread chats:', err);
        }
      };

      checkUnreadNotifications();
      checkUnreadChats();

      return () => {
        if (sock) {
          sock.off('userStatusChanged');
          sock.off('newNotification');
          sock.off('receiveMessage');
        }
        if (activeTimer) clearTimeout(activeTimer);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setUnreadNotificationsCount(0);
      setHasUnreadChats(false);
      setToast(null);
    }
  }, [user]);

  // Color mapping based on notification type for glassmorphic styling
  const getToastColors = () => {
    if (!toast) return {};
    switch (toast.type) {
      case 'ACCEPTED':
        return { border: '1px solid rgba(16, 185, 129, 0.4)', glow: 'rgba(16, 185, 129, 0.25)', icon: 'rgba(16, 185, 129, 0.1)' };
      case 'REJECTED':
        return { border: '1px solid rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.25)', icon: 'rgba(239, 68, 68, 0.1)' };
      case 'INTEREST':
        return { border: '1px solid rgba(99, 102, 241, 0.4)', glow: 'rgba(99, 102, 241, 0.25)', icon: 'rgba(99, 102, 241, 0.1)' };
      case 'CHAT':
        return { border: '1px solid rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.25)', icon: 'rgba(139, 92, 246, 0.1)' };
      default:
        return { border: '1px solid rgba(255, 255, 255, 0.15)', glow: 'rgba(255, 255, 255, 0.05)', icon: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  const colors = getToastColors();

  return (
    <SocketContext.Provider value={{ 
      socket, 
      onlineUsers, 
      unreadNotificationsCount, 
      setUnreadNotificationsCount,
      hasUnreadChats,
      setHasUnreadChats
    }}>
      {children}

      {/* Floating Glassmorphic Alert Notification Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          zIndex: 99999,
          width: '360px',
          background: 'rgba(15, 11, 28, 0.82)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: colors.border,
          boxShadow: `0 12px 40px ${colors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
          padding: '16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          color: 'white',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {toast.message}
            </div>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
          >
            ✕
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
