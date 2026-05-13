import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Smile, TrendingUp, Flame } from 'lucide-react';
import './Wall.css';

// Generate demo timestamps relative to now for natural display
const now = Date.now();
const mins = (m) => new Date(now - m * 60000).toISOString();

// Demo messages for initial state
const DEMO_MESSAGES = [
  { id: 1, userId: 4, userName: 'Santiago', avatar: '🔥', text: 'Argentina pasa primero seguro 🇦🇷💪', timestamp: mins(280) },
  { id: 2, userId: 3, userName: 'Lucía', avatar: '🌟', text: 'Brasil - Marruecos va a ser un partidazo en el grupo C', timestamp: mins(210) },
  { id: 3, userId: 2, userName: 'Maxi', avatar: '⚽', text: 'Le puse 3-1 a USA vs Paraguay, fija que Pulisic la rompe', timestamp: mins(140) },
  { id: 4, userId: 5, userName: 'Valentina', avatar: '💫', text: '¿Alguien le puso empate al Brasil - Marruecos? Yo sí 😏', timestamp: mins(95) },
  { id: 5, userId: 4, userName: 'Santiago', avatar: '🔥', text: 'Alemania 4-0 a Curazao, demasiado fácil jajaja', timestamp: mins(60) },
  { id: 6, userId: 2, userName: 'Maxi', avatar: '⚽', text: 'Le emboqué el exacto al México - Sudáfrica 🎯🔥 +3 puntos', timestamp: mins(35) },
  { id: 7, userId: 3, userName: 'Lucía', avatar: '🌟', text: 'El que le emboque el resultado exacto a USA vs Paraguay gana café gratis en el coworking ☕', timestamp: mins(15) },
  { id: 8, userId: 1, userName: 'Admin LineUp', avatar: '👑', text: '⚡ Recuerden: los pronósticos se bloquean 15 minutos antes de cada partido. ¡No se duerman!', timestamp: mins(5) },
];

export default function Wall() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('prode_wall');
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        setMessages(DEMO_MESSAGES);
        localStorage.setItem('prode_wall', JSON.stringify(DEMO_MESSAGES));
      }
    } else {
      setMessages(DEMO_MESSAGES);
      localStorage.setItem('prode_wall', JSON.stringify(DEMO_MESSAGES));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('prode_wall', JSON.stringify(updated));
    setNewMessage('');
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
      {/* Header */}
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

      {/* Messages */}
      <div className="wall-messages container">
        <div className="messages-list">
          {messages.map((msg) => {
            const isMe = user && msg.userId === user.id;
            return (
              <div key={msg.id} className={`message ${isMe ? 'message-mine' : ''}`}>
                <div className="message-avatar">{msg.avatar}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-name">{msg.userName}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
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
