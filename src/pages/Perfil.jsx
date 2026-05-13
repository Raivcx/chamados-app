import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { profile, updateProfile } = useAuth();
  const [tab, setTab] = useState('dados');
  const [nome, setNome] = useState(profile?.nome || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [telefone, setTelefone] = useState(profile?.telefone || '');
  const [saving, setSaving] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [savingSenha, setSavingSenha] = useState(false);

  const handleSaveDados = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({ nome, email, telefone });
    if (result.success) {
      toast.success('Dados atualizados com sucesso!');
    } else {
      toast.error(result.message || 'Erro ao atualizar.');
    }
    setSaving(false);
  };

  const handleSaveSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setSavingSenha(true);

    // Supabase Auth: atualizar senha do usuário
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } else {
      setSenhaAtual('');
      setNovaSenha('');
      toast.success('Senha alterada com sucesso!');
    }
    setSavingSenha(false);
  };

  const TABS = [
    { id: 'dados', label: 'Dados Pessoais', icon: 'person' },
    { id: 'seguranca', label: 'Segurança e Acesso', icon: 'lock' },
  ];

  const initials = profile?.nome
    ? profile.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-headline-md text-[22px] font-bold text-on-surface">Perfil do Usuário</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 bg-surface-container-low border border-outline-variant/30 rounded-lg p-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-[22px] font-bold text-on-surface-variant shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-on-surface">{profile?.nome}</p>
          <p className="text-[13px] text-on-surface-variant">{profile?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border border-primary/30 bg-primary/10 text-primary">
            {profile?.cargo}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/30">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'dados' && (
        <form onSubmit={handleSaveDados} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">E-mail</label>
            <input type="email" value={email} disabled className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface/50 focus:border-primary/50 outline-none transition-all cursor-not-allowed" />
            <p className="text-[11px] text-on-surface-variant/50 mt-1">O e-mail não pode ser alterado por esta interface.</p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" placeholder="(XX) XXXXX-XXXX" />
          </div>
          <button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded text-[14px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}

      {tab === 'seguranca' && (
        <form onSubmit={handleSaveSenha} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Nova Senha</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={6} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" placeholder="Mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={savingSenha} className="bg-primary text-on-primary px-6 py-2.5 rounded text-[14px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
            {savingSenha ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            )}
            {savingSenha ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      )}
    </div>
  );
}
