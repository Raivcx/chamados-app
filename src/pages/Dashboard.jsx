import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const SUMMARY_CARDS = [
  { key: 'abertos', label: 'Chamados Abertos', icon: 'trending_up', accentColor: 'error' },
  { key: 'progresso', label: 'Em Atendimento', icon: 'sync', accentColor: 'secondary' },
  { key: 'pendentes', label: 'Pendentes', icon: 'inventory_2', accentColor: 'tertiary' },
  { key: 'concluidos', label: 'Concluídos (Mês)', icon: 'check_circle', accentColor: 'primary' },
];

export default function Dashboard() {
  const { tickets, categories, statuses, getCategoryName, getStatusObj, getPriorityObj, getUserName, updateTicket, loadingData } = useApp();
  const { isCliente } = useAuth();
  const navigate = useNavigate();
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const statusByName = useMemo(() => {
    const map = {};
    statuses.forEach((s) => { map[s.nome] = s.id; });
    return map;
  }, [statuses]);

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="font-body-md animate-pulse">Sincronizando chamados...</p>
      </div>
    );
  }

  const concluidoId = statusByName['Concluído'];

  const counts = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nonClosed = tickets.filter((t) => t.status_id !== concluidoId);
    const progressIds = [statusByName['Em Progresso'], statusByName['Aguardando Cliente'], statusByName['Aguardando Suporte']].filter(Boolean);
    const pendingIds = [statusByName['Pendente'], statusByName['Validando']].filter(Boolean);

    return {
      abertos: nonClosed.length,
      progresso: tickets.filter((t) => progressIds.includes(t.status_id)).length,
      pendentes: tickets.filter((t) => pendingIds.includes(t.status_id)).length,
      concluidos: tickets.filter((t) => t.status_id === concluidoId && t.data_fechamento && new Date(t.data_fechamento) >= monthStart).length,
    };
  }, [tickets, concluidoId, statusByName]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterCat !== 'all' && t.categoria_id !== filterCat) return false;
      if (filterStatus !== 'all' && t.status_id !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchId = (t.codigo || t.id).toLowerCase().includes(q);
        const matchAssunto = t.assunto.toLowerCase().includes(q);
        const matchUser = getUserName(t.criado_por).toLowerCase().includes(q);
        if (!matchId && !matchAssunto && !matchUser) return false;
      }
      return true;
    });
  }, [tickets, filterCat, filterStatus, search, getUserName]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      /* search already reactive */
    }
  };

  const accentMap = { error: 'error', secondary: 'secondary', tertiary: 'tertiary', primary: 'primary' };

  // --- Dados para os Gráficos ---
  const chartCategories = useMemo(() => {
    return categories.map(cat => ({
      name: cat.nome,
      value: tickets.filter(t => t.categoria_id === cat.id).length
    })).filter(c => c.value > 0);
  }, [tickets, categories]);

  const chartStatuses = useMemo(() => {
    return statuses.map(stat => ({
      name: stat.nome,
      Quantidade: tickets.filter(t => t.status_id === stat.id).length
    })).filter(s => s.Quantidade > 0);
  }, [tickets, statuses]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card) => {
          const accent = accentMap[card.accentColor];
          return (
            <div
              key={card.key}
              className={`bg-surface-container-low border border-outline-variant/30 rounded p-4 relative overflow-hidden group hover:border-${accent}/30 transition-colors`}
            >
              <div className={`absolute top-0 left-0 w-0.5 h-full bg-${accent}/80 group-hover:bg-${accent} transition-colors`} />
              <h3 className="font-label-caps text-[11px] text-on-surface-variant mb-2 uppercase tracking-widest font-semibold">
                {card.label}
              </h3>
              <div className="flex items-end justify-between">
                <span className="font-headline-lg text-[28px] text-on-surface font-light leading-none">
                  {counts[card.key]}
                </span>
                <span className={`material-symbols-outlined text-${accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  {card.icon}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Gráficos */}
      {(!isCliente && tickets.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Por Categoria */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded p-5">
            <h3 className="font-title-sm text-[14px] font-semibold text-on-surface mb-4">Volume por Categoria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {chartCategories.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>

          {/* Por Status */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded p-5">
            <h3 className="font-title-sm text-[14px] font-semibold text-on-surface mb-4">Gargalos por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartStatuses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="Quantidade" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartStatuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Actions & Filters */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <button
          onClick={() => navigate('/chamados/novo')}
          className="bg-primary text-on-primary border border-transparent hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 px-5 py-2 rounded text-[14px] font-medium flex items-center shadow-sm"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Novo Chamado
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded text-[13px] font-medium transition-all border ${
              filterCat === 'all'
                ? 'bg-surface-container-highest border-primary/40 text-primary shadow-[0_0_8px_rgba(255,255,255,0.05)]'
                : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id === filterCat ? 'all' : cat.id)}
              className={`px-3 py-1.5 rounded text-[13px] transition-all border hidden sm:block ${
                filterCat === cat.id
                  ? 'bg-surface-container-highest border-primary/40 text-primary font-medium'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded flex flex-col shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="font-title-sm text-[15px] font-medium text-on-surface">Gerenciamento de Chamados</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full sm:w-56 bg-surface-container-highest/50 border border-outline-variant/20 rounded py-1.5 pl-8 pr-3 text-[12px] text-on-surface placeholder:text-on-surface-variant focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                placeholder="Buscar por título ou usuário..."
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface-container-highest/50 border border-outline-variant/20 rounded py-1.5 px-2 text-[12px] text-on-surface outline-none focus:border-primary/50 transition-all"
            >
              <option value="all">Todos Status</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap w-24">ID</th>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider min-w-[200px]">Assunto</th>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Categoria</th>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Prioridade</th>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm text-[13px] text-on-surface">
              {filtered.map((t) => {
                const status = getStatusObj(t.status_id);
                const priority = getPriorityObj(t.prioridade_id);
                return (
                  <tr 
                    key={t.id} 
                    onClick={() => navigate(`/chamados/${t.id}`)}
                    className="hover:bg-surface-container-low/50 transition-colors group h-12 cursor-pointer"
                  >
                    <td className="px-4 py-2 font-code-mono text-on-surface-variant opacity-80">#{t.codigo}</td>
                    <td className="px-4 py-2 truncate max-w-xs font-medium text-on-surface">{t.assunto}</td>
                    <td className="px-4 py-2">
                      <span className="inline-block px-2 py-0.5 border border-outline-variant/30 rounded text-[11px] text-on-surface-variant bg-surface-container-lowest">
                        {getCategoryName(t.categoria_id)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority?.cor || '#8e9195' }} />
                        <span className="text-on-surface-variant">{priority?.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-medium text-[11px] border" style={{
                        backgroundColor: `${status?.cor}15`,
                        borderColor: `${status?.cor}30`,
                        color: status?.cor,
                      }}>
                        {status?.nome}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <div
                          className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Ver Detalhes"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-[13px]">
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-outline-variant/20">
          {filtered.map((t) => {
            const status = getStatusObj(t.status_id);
            const priority = getPriorityObj(t.prioridade_id);
            return (
              <div key={t.id} className="p-4 space-y-2" onClick={() => navigate(`/chamados/${t.id}`)}>
                <div className="flex justify-between items-start">
                  <span className="font-code-mono text-[11px] text-on-surface-variant opacity-80">#{t.codigo}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-medium text-[10px] border" style={{
                    backgroundColor: `${status?.cor}15`, borderColor: `${status?.cor}30`, color: status?.cor,
                  }}>{status?.nome}</span>
                </div>
                <p className="text-[13px] font-medium text-on-surface leading-snug">{t.assunto}</p>
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                  <span className="inline-block px-1.5 py-0.5 border border-outline-variant/30 rounded bg-surface-container-lowest">{getCategoryName(t.categoria_id)}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority?.cor || '#8e9195' }} />
                    {priority?.nome}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant text-[13px]">Nenhum chamado encontrado.</div>
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-2 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center text-[12px] text-on-surface-variant">
          <span>Mostrando {filtered.length} de {tickets.length} registros</span>
        </div>
      </section>
    </div>
  );
}
