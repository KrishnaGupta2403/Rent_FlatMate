'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import ChatBox from '../../../components/chat/ChatBox';
import { chatService } from '../../../services/chatService';
import { ROLES } from '../../../constants';

export default function TenantChatPage() {
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
        console.error('Failed to load chats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
      <div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '8px' }}>💬 Real-Time Chat Rooms</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Connect instantly with property owners over Socket.IO once your interest application is accepted!
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading active chat rooms...</div>
        ) : chats.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Active Chats</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Chat rooms are automatically generated once a property owner accepts your interest request.
            </p>
            <a href="/tenant/listings" className="btn-primary">Browse Listings & Apply →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '560px' }}>
            {/* Sidebar List */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '560px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                Active Conversations ({chats.length})
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
                    {chat.owner?.fullName?.split(' ')[0] || chat.owner?.name?.split(' ')[0] || chat.owner?.email?.split('@')[0] || `Owner #${chat.ownerId?.slice(0, 6)}`}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: selectedChat?.id === chat.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginTop: '4px' }}>
                    Listing: {chat.listing?.title || `#${chat.listingId?.slice(0, 6)}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Box Area */}
            <div>
              {selectedChat ? (
                <ChatBox
                  chatId={selectedChat.id}
                  recipientEmail={`Owner: ${selectedChat.owner?.email || selectedChat.ownerId?.slice(0, 8)}`}
                />
              ) : (
                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Select a conversation from the sidebar to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
