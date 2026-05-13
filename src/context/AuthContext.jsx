import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de sesión (login, logout, Google callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Traer el perfil del usuario desde la base de datos
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al traer perfil:', error);
      setLoading(false);
      return;
    }

    setUser(data);
    setLoading(false);
  };

  // Login con email y contraseña
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Email o contraseña incorrectos' };
    return { success: true };
  };

  // Registro con email y contraseña
  const register = async (name, email, password) => {
    if (!name.trim()) return { success: false, error: 'Ingresá tu nombre' };
    if (!email.includes('@')) return { success: false, error: 'Ingresá un email válido' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name } // El trigger de Supabase usa esto para crear el perfil
      }
    });

    if (error) return { success: false, error: error.message };
    if (data.user && !data.session) {
      return { success: false, error: 'Revisá tu email para confirmar la cuenta' };
    }
    return { success: true };
  };

  // Login con Google - abre el popup de Google
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Cerrar sesión
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};