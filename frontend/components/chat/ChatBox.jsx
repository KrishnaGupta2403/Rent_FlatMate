'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';

export default function ChatBox({ chatId, recipientEmail }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await chatService.getChatMessages(chatId);
        if (res && res.messages) {
          setMessages(res.messages);
        } else if (Array.isArray(res)) {
          setMessages(res);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Socket listeners
    if (socket) {
      socket.emit('joinRoom', { chatId });

      socket.on('receiveMessage', (newMsg) => {
        if (newMsg.chatId === chatId) {
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
          socket.emit('markAsRead', { chatId });
        }
      });

      socket.on('userTyping', ({ chatId: tChatId, userId: tUserId }) => {
        if (tChatId === chatId && tUserId !== user?.id) {
          setTypingUser(true);
        }
      });

      socket.on('userStoppedTyping', ({ chatId: tChatId, userId: tUserId }) => {
        if (tChatId === chatId && tUserId !== user?.id) {
          setTypingUser(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
        socket.off('userTyping');
        socket.off('userStoppedTyping');
      }
    };
  }, [chatId, socket, user?.id]);

  const handleInputChange = (e) => {
    setInputMsg(e.target.value);
    if (!socket) return;

    socket.emit('typing', { chatId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { chatId });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const textToSend = inputMsg;
    setInputMsg('');
    if (socket) socket.emit('stopTyping', { chatId });

    try {
      // If socket is connected, send via WebSocket
      if (socket && socket.connected) {
        socket.emit('sendMessage', {
          chatId,
          message: textToSend,
          messageType: 'TEXT',
        }, (ack) => {
          if (ack && ack.message) {
            setMessages((prev) => [...prev, ack.message]);
            scrollToBottom();
          }
        });
      } else {
        // Fallback to REST API
        const res = await chatService.sendMessage(chatId, {
          message: textToSend,
          messageType: 'TEXT',
        });
        if (res && res.message) {
          setMessages((prev) => [...prev, res.message]);
          scrollToBottom();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '560px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            💬 {recipientEmail || 'Chat Room'}
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Real-time WebSocket Active
          </span>
        </div>
      </div>

      {/* Messages Window */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id || idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div style={{
                  background: isMe ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  fontSize: '0.92rem',
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}>
                  {msg.message || msg.content}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </div>
              </div>
            );
          })
        )}
        {typingUser && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            ✍️ Recipient is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Type your message via Socket.IO..."
          value={inputMsg}
          onChange={handleInputChange}
          style={{ flex: 1, background: 'var(--bg-secondary)' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
          Send
        </button>
      </form>
    </div>
  );
}
