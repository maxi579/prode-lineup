import { createContext, useContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const AuthContext = createContext(null);

// Initialize EmailJS with public key
// Users should set up a free account at https://www.emailjs.com/
// Create a service (Gmail), template, and paste the IDs below
const EMAILJS_SERVICE_ID = 'service_prode';
const EMAILJS_TEMPLATE_ID = 'template_welcome';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

// Mock user database (in production, this would be a real backend)
const MOCK_USERS = [
  { id: 1, name: 'Admin LineUp', email: 'admin@lineup.com', password: 'lineup2026', avatar: '👑', isAdmin: true },
  { id: 2, name: 'Maxi', email: 'maxi@lineup.com', password: '1234', avatar: '⚽', isAdmin: false },
  { id: 3, name: 'Lucía', email: 'lucia@gmail.com', password: '1234', avatar: '🌟', isAdmin: false },
  { id: 4, name: 'Santiago', email: 'santi@hotmail.com', password: '1234', avatar: '🔥', isAdmin: false },
  { id: 5, name: 'Valentina', email: 'vale@outlook.com', password: '1234', avatar: '💫', isAdmin: false },
];

// Send welcome email via EmailJS
const sendWelcomeEmail = async (name, email) => {
  // Skip if EmailJS is not configured (demo mode)
  if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.log('📧 Demo mode: email de bienvenida simulado para', email);
    return false;
  }
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_name: name,
        to_email: email,
        from_name: 'Prode LineUp',
        message: `¡Bienvenido/a al Prode LineUp, ${name}! 🏆⚽\n\nTu cuenta fue creada exitosamente con el email: ${email}\n\nYa podés empezar a hacer tus pronósticos para el Mundial 2026.\n\n¡Mucha suerte!\n— Equipo Prode LineUp`,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Email de bienvenida enviado a:', email);
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo enviar el email de bienvenida:', error?.text || error);
    // Don't block registration if email fails
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('prode_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('prode_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const userData = { id: found.id, name: found.name, email: found.email, avatar: found.avatar, isAdmin: found.isAdmin };
      setUser(userData);
      localStorage.setItem('prode_user', JSON.stringify(userData));
      setEmailSent(false);
      return { success: true };
    }
    return { success: false, error: 'Email o contraseña incorrectos' };
  };

  const register = async (name, email, password) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Ingresá un email válido' };
    }
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) {
      return { success: false, error: 'Este email ya está registrado' };
    }
    const avatars = ['⚽', '🏆', '🌟', '🔥', '💫', '⭐', '🎯', '🏅'];
    const newUser = {
      id: MOCK_USERS.length + 1,
      name,
      email,
      password,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      isAdmin: false,
    };
    MOCK_USERS.push(newUser);
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, isAdmin: false };
    setUser(userData);
    localStorage.setItem('prode_user', JSON.stringify(userData));

    // Send welcome email (non-blocking)
    const sent = await sendWelcomeEmail(name, email);
    setEmailSent(sent);

    return { success: true, emailSent: sent };
  };

  const logout = () => {
    setUser(null);
    setEmailSent(false);
    localStorage.removeItem('prode_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, emailSent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
