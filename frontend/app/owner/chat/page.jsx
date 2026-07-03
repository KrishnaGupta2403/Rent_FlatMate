'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import ChatBox from '../../../components/chat/ChatBox';
import { chatService } from '../../../services/chatService';
import { ROLES } from '../../../constants';

export default function OwnerChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatService.getUserChats();
        const list = res?.chats || (Array.isArray(res) ? res : []);
        setChats(list);
        if (list.length > 0) {
          setSelectedChat(list[0]);
        }
      } catch (err) {
        console.error('Failed to load owner chats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '8px' }}>💬 Real-Time Tenant Chats</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Communicate with prospective tenants over Socket.IO once their application is accepted!
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading active chat rooms...</div>
        ) : chats.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Active Conversations</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Accept incoming tenant applications on your properties to initiate real-time chat rooms.
            </p>
            <a href="/owner/requests" className="btn-primary">Review Applications →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '560px' }}>
            {/* Sidebar */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '560px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                Tenant Conversations ({chats.length})
              </div>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: selectedChat?.id === chat.id ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                    color: selectedChat?.id === chat.id ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                    {chat.tenant?.fullName?.split(' ')[0] || chat.tenant?.name?.split(' ')[0] || chat.tenant?.email?.split('@')[0] || `Tenant #${chat.tenantId?.slice(0, 6)}`}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: selectedChat?.id === chat.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginTop: '4px' }}>
                    Listing: {chat.listing?.title || `#${chat.listingId?.slice(0, 6)}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Box */}
            <div>
              {selectedChat ? (
                <ChatBox
                  chatId={selectedChat.id}
                  recipientEmail={`Tenant: ${selectedChat.tenant?.email || selectedChat.tenantId?.slice(0, 8)}`}
                />
              ) : (
                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Select a tenant conversation from the sidebar to chat.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
