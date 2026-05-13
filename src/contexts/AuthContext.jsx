import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Perfil não encontrado ou erro:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Erro na requisição de perfil:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Timeout de segurança: se não carregar em 6 segundos, libera a tela
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('AuthContext: Timeout de carregamento atingido. Forçando desbloqueio.');
        setLoading(false);
      }
    }, 6000);

    async function initializeAuth() {
      try {
        console.log('AuthContext: Inicializando sessão...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Erro no getSession:', error.message);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log('AuthContext: Usuário logado encontrado:', session.user.email);
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted) {
            console.log('AuthContext: Perfil carregado:', p?.nome || 'Não encontrado');
            setProfile(p);
          }
        } else {
          console.log('AuthContext: Nenhum usuário logado.');
        }
      } catch (err) {
        console.error('AuthContext: Erro crítico na inicialização:', err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Estado de autenticação alterado:', event);
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        if (mounted) setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false);
        clearTimeout(timeout);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, loading]);

  const login = useCallback(async (emailOrUsername, senha) => {
    try {
      let email = emailOrUsername;

      if (!emailOrUsername.includes('@')) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .or(`username.ilike.${emailOrUsername},nome.ilike.${emailOrUsername}`)
          .limit(1);

        if (profiles && profiles.length > 0) {
          email = profiles[0].email;
        } else {
          return { success: false, message: 'Usuário não encontrado.' };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) return { success: false, message: 'Credenciais inválidas.' };

      const p = await fetchProfile(data.user.id);
      setProfile(p);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Erro ao realizar login.' };
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    setProfile(data);
    return { success: true };
  }, [user]);

  const authValue = useMemo(() => ({
    user,
    profile,
    login,
    logout,
    updateProfile,
    isAdmin: profile?.cargo === 'admin',
    isTecnico: profile?.cargo === 'tecnico',
    isCliente: profile?.cargo === 'cliente',
    loading
  }), [user, profile, login, logout, updateProfile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-on-surface-variant text-[13px] font-medium">Iniciando sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
