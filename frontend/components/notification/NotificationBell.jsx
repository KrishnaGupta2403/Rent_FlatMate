'use client';
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';

export default function NotificationBell() {
  const { unreadNotificationsCount, setUnreadNotificationsCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 10 });
      if (res && res.notifications) {
        setNotifications(res.notifications);
        const unread = res.notifications.filter(n => !n.isRead).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleDropdown}
        style={{ position: 'relative', fontSize: '1.3rem', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}
        title="Notifications"
      >
        🔔
        {unreadNotificationsCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
          }}>
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          right: 0,
          top: '48px',
          width: '340px',
          maxHeight: '420px',
          overflowY: 'auto',
          zIndex: 200,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
            {unreadNotificationsCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications yet.</div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: notif.isRead ? 'rgba(0,0,0,0.15)' : 'rgba(99, 102, 241, 0.15)',
                  borderLeft: notif.isRead ? '2px solid transparent' : '3px solid var(--accent-primary)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
