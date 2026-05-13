import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const { categories, statuses, users, deleteAllTickets, systemSettings } = useApp();
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('sistema');
  const [dangerPassword, setDangerPassword] = useState('');
  const [showDanger, setShowDanger] = useState(false);

  if (!isAdmin) return <div className="text-center py-12 text-on-surface-variant">Acesso restrito ao administrador.</div>;

  const handleDeleteAll = async () => {
    if (dangerPassword !== 'CONFIRMAR') { toast.error('Digite CONFIRMAR para prosseguir.'); return; }
    const ok = await deleteAllTickets();
    if (ok) {
      setDangerPassword(''); setShowDanger(false);
      toast.success('Todos os chamados foram excluídos.');
    } else {
      toast.error('Erro ao excluir chamados.');
    }
  };

  const TABS = [
    { id: 'sistema', label: 'Sistema', icon: 'tune' },
    { id: 'categorias', label: 'Categorias', icon: 'category' },
    { id: 'status', label: 'Status', icon: 'flag' },
    { id: 'usuarios', label: 'Usuários', icon: 'group' },
    { id: 'perigo', label: 'Zona de Perigo', icon: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-headline-md text-[22px] font-bold text-on-surface">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/30 pb-px -mb-px">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2.5 text-[13px] font-medium flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'} ${t.id === 'perigo' ? '!text-error' : ''}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Sistema */}
      {tab === 'sistema' && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 space-y-4">
          <h2 className="font-title-sm text-[15px] font-medium text-on-surface">Personalização do Sistema</h2>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Título do Sistema</label>
            <input defaultValue={systemSettings.titulo} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Subtítulo</label>
            <input defaultValue={systemSettings.subtitulo} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[14px] text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" />
          </div>
          <button onClick={() => toast.success('Configurações salvas!')} className="bg-primary text-on-primary px-5 py-2 rounded text-[14px] font-medium hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>Salvar
          </button>
        </div>
      )}

      {/* Categorias */}
      {tab === 'categorias' && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title-sm text-[15px] font-medium text-on-surface">Categorias de Chamados</h2>
            <button onClick={() => toast('Funcionalidade disponível na próxima iteração', { icon: '🚧' })} className="text-[13px] text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">add</span>Adicionar
            </button>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <span className="text-[14px] text-on-surface">{c.nome}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  <button className="p-1.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {tab === 'status' && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title-sm text-[15px] font-medium text-on-surface">Status de Chamados</h2>
            <button onClick={() => toast('Funcionalidade disponível na próxima iteração', { icon: '🚧' })} className="text-[13px] text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">add</span>Adicionar
            </button>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {statuses.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border border-outline-variant/30" style={{ backgroundColor: s.cor }} />
                  <span className="text-[14px] text-on-surface">{s.nome}</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  <button className="p-1.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuários */}
      {tab === 'usuarios' && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
          <h2 className="font-title-sm text-[15px] font-medium text-on-surface mb-4">Gerenciamento de Usuários</h2>
          <div className="divide-y divide-outline-variant/20">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-[11px] font-bold text-on-surface-variant">
                    {u.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-on-surface">{u.nome}</p>
                    <p className="text-[11px] text-on-surface-variant">{u.email} · <span className="uppercase font-semibold">{u.cargo}</span></p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  {u.id !== '1' && <button className="p-1.5 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zona de Perigo */}
      {tab === 'perigo' && (
        <div className="bg-error-container/20 border border-error/30 rounded-lg p-6 space-y-4">
          <h2 className="font-title-sm text-[15px] font-medium text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>Zona de Perigo
          </h2>
          <p className="text-[13px] text-on-surface-variant">Ações irreversíveis. Proceda com cautela.</p>
          {!showDanger ? (
            <button onClick={() => setShowDanger(true)} className="bg-error/10 text-error border border-error/30 px-5 py-2 rounded text-[14px] font-medium hover:bg-error/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>Excluir Todos os Chamados
            </button>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded p-4 space-y-3">
              <p className="text-[13px] text-error font-medium">Digite <code className="bg-error/10 px-1 rounded">CONFIRMAR</code> para excluir TODOS os chamados:</p>
              <input type="text" value={dangerPassword} onChange={(e) => setDangerPassword(e.target.value)} className="w-full bg-surface-container-lowest border border-error/30 rounded py-2 px-3 text-[14px] text-on-surface outline-none focus:ring-1 focus:ring-error/50" placeholder="CONFIRMAR" />
              <div className="flex gap-2">
                <button onClick={handleDeleteAll} className="bg-error text-on-error px-5 py-2 rounded text-[14px] font-medium hover:bg-error/80 transition-all">Confirmar Exclusão</button>
                <button onClick={() => { setShowDanger(false); setDangerPassword(''); }} className="px-5 py-2 rounded text-[14px] text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-all">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
