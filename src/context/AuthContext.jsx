import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          await fetchProfile(data.session.user.id);
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    handleAuthCallback();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      let { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!data) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const name = authUser?.user_metadata?.full_name ||
                     authUser?.user_metadata?.name ||
                     authUser?.email?.split('@')[0] || 'Usuario';

        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: userId, name, email: authUser.email, avatar: '⚽' })
          .select()
          .single();

        data = newProfile;
      }

      if (data) setUser(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Email o contraseña incorrectos' };
    return { success: true };
  };

  const register = async (name, email, password) => {
    if (!name.trim()) return { success: false, error: 'Ingresá tu nombre' };
    if (!email.includes('@')) return { success: false, error: 'Ingresá un email válido' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) return { success: false, error: error.message };
    if (data.user && !data.session) {
      return { success: false, error: 'Revisá tu email para confirmar la cuenta' };
    }
    return { success: true };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

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