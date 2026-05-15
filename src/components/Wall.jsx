import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Flame } from 'lucide-react';
import './Wall.css';

export default function Wall() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Escuchar mensajes nuevos en tiempo real
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando mensajes:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      user_name: user.name,
      avatar: user.avatar || '⚽',
      text: newMessage.trim(),
    });

    if (error) {
      console.error('Error enviando mensaje:', error);
    } else {
      setNewMessage('');
    }
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="wall-page">
      <div className="wall-header">
        <div className="container wall-header-inner">
          <div>
            <h1 className="page-title">
              <MessageSquare size={28} className="title-icon" />
              Muro de Cargas
            </h1>
            <p className="page-desc">Comentá, cargá y divertite con el coworking</p>
          </div>
          <div className="wall-stats">
            <div className="wall-stat">
              <Flame size={16} />
              <span>{messages.length} mensajes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wall-messages container">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
            Cargando mensajes...
          </p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
            Sé el primero en escribir algo ⚽
          </p>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => {
              const isMe = user && msg.user_id === user.id;
              return (
                <div key={msg.id} className={`message ${isMe ? 'message-mine' : ''}`}>
                  <div className="message-avatar">{msg.avatar}</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-name">{msg.user_name}</span>
                      <span className="message-time">{formatTime(msg.created_at)}</span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="wall-input-container">
        <form className="wall-input-form container" onSubmit={handleSend}>
          <input
            type="text"
            className="input wall-input"
            placeholder="Escribí tu mensaje..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            maxLength={280}
          />
          <button type="submit" className="btn btn-primary btn-icon send-btn" disabled={!newMessage.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

