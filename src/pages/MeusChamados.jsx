import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { id: 'todos', label: 'Todos', icon: 'list' },
  { id: 'abertos', label: 'Abertos', icon: 'pending_actions' },
  { id: 'fechados', label: 'Fechados', icon: 'task_alt' },
];

export default function MeusChamados() {
  const { tickets, statuses, getCategoryName, getStatusObj, getPriorityObj, getUserName, getComments } = useApp();
  const { user, isCliente } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('todos');

  const statusConcluido = statuses.find((s) => s.nome === 'Concluído');
  const concluidoId = statusConcluido?.id;

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        if (isCliente && t.criado_por !== user.id) return false;
        return true;
      })
      .filter((t) => {
        if (activeTab === 'abertos') return t.status_id !== concluidoId;
        if (activeTab === 'fechados') return t.status_id === concluidoId;
        return true;
      })
      .filter((t) => {
        if (filterStatus !== 'all' && t.status_id !== filterStatus) return false;
        return true;
      })
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (t.codigo || t.id).toLowerCase().includes(q) ||
          t.assunto.toLowerCase().includes(q) ||
          getUserName(t.criado_por).toLowerCase().includes(q)
        );
      });
  }, [tickets, user, isCliente, filterStatus, search, activeTab, getUserName, concluidoId]);

  const counts = useMemo(() => ({
    todos: tickets.filter((t) => !isCliente || t.criado_por === user.id).length,
    abertos: tickets.filter((t) => (!isCliente || t.criado_por === user.id) && t.status_id !== concluidoId).length,
    fechados: tickets.filter((t) => (!isCliente || t.criado_por === user.id) && t.status_id === concluidoId).length,
  }), [tickets, user, isCliente, concluidoId]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-headline-md text-[22px] font-bold text-on-surface">Meus Chamados</h1>
        <button
          onClick={() => navigate('/chamados/novo')}
          className="bg-primary text-on-primary px-4 py-2 rounded text-[13px] font-medium flex items-center hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined mr-2 text-[16px]">add</span>
          Novo Chamado
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setFilterStatus('all'); }}
            className={`px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
            <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === tab.id
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-container-highest/50 text-on-surface-variant'
            }`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 pl-9 pr-3 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
            placeholder="Buscar chamados por título ou usuário..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[13px] text-on-surface outline-none focus:border-primary/50 transition-all"
        >
          <option value="all">Todos Status</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {filteredTickets.map((t) => {
          const status = getStatusObj(t.status_id);
          const priority = getPriorityObj(t.prioridade_id);
          const commentCount = getComments(t.id).length;

          return (
            <div
              key={t.id}
              onClick={() => navigate(`/chamados/${t.id}`)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 cursor-pointer hover:border-outline-variant/60 hover:bg-surface-container-low/80 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-code-mono text-[11px] text-on-surface-variant">#{t.codigo}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority?.cor || '#8e9195' }} />
                    <span className="text-[11px] text-on-surface-variant">{priority?.nome}</span>
                    {commentCount > 1 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant/60">
                        <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
                        {commentCount - 1}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">{t.assunto}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-on-surface-variant">
                    <span className="inline-block px-1.5 py-0.5 border border-outline-variant/30 rounded bg-surface-container-lowest">
                      {getCategoryName(t.categoria_id)}
                    </span>
                    <span>{getUserName(t.criado_por)}</span>
                    <span>{new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded font-medium text-[11px] border" style={{
                    backgroundColor: `${status?.cor}15`, borderColor: `${status?.cor}30`, color: status?.cor,
                  }}>{status?.nome}</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40 group-hover:text-primary transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant text-[14px]">
            <span className="material-symbols-outlined text-[56px] opacity-20 block mb-3">inbox</span>
            <p className="font-medium text-on-surface mb-1">Nenhum chamado encontrado</p>
            <p className="text-[13px]">Tente ajustar os filtros ou crie um novo chamado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
