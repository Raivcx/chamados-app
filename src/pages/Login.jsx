import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    const result = await login(email, senha);
    if (result.success) {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-xl bg-surface-container-high flex items-center justify-center mb-4 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[36px] text-primary opacity-80">support_agent</span>
          </div>
          <h1 className="font-headline-md text-[24px] font-bold text-on-surface tracking-tight">
            Suporte Técnico
          </h1>
          <p className="text-on-surface-variant text-[13px] mt-1">Acesse o painel de controle</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Usuário ou E-mail
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-2.5 rounded text-[14px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                Entrar
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-on-surface-variant/60 mt-2">
            Admin: <code className="text-on-surface-variant bg-surface-container px-1 rounded">admin@techsupport.com</code> / <code className="text-on-surface-variant bg-surface-container px-1 rounded">admin123</code>
          </p>
        </form>
      </div>
    </div>
  );
}
