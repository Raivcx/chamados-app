import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Relatorios() {
  const { tickets, categories, statuses, getCategoryName, getStatusObj } = useApp();

  const statusConcluido = statuses.find((s) => s.nome === 'Concluído');
  const concluidoId = statusConcluido?.id;

  const stats = useMemo(() => {
    const total = tickets.length;
    const abertos = tickets.filter((t) => t.status_id !== concluidoId).length;
    const concluidos = tickets.filter((t) => t.status_id === concluidoId).length;
    const porCategoria = categories.map((c) => ({
      ...c, count: tickets.filter((t) => t.categoria_id === c.id).length,
    }));
    const tempoMedio = (() => {
      const fechados = tickets.filter((t) => t.data_fechamento);
      if (!fechados.length) return 0;
      const total = fechados.reduce((acc, t) => acc + (new Date(t.data_fechamento) - new Date(t.created_at)), 0);
      return Math.round(total / fechados.length / (1000 * 60 * 60));
    })();
    return { total, abertos, concluidos, porCategoria, tempoMedio };
  }, [tickets, categories]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline-md text-[22px] font-bold text-on-surface">Relatórios</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total de Chamados', value: stats.total, icon: 'confirmation_number' },
          { label: 'Abertos', value: stats.abertos, icon: 'pending_actions' },
          { label: 'Concluídos', value: stats.concluidos, icon: 'task_alt' },
          { label: 'Tempo Médio (h)', value: `${stats.tempoMedio}h`, icon: 'schedule' },
        ].map((card) => (
          <div key={card.label} className="bg-surface-container-low border border-outline-variant/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-70">{card.icon}</span>
              <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold">{card.label}</h3>
            </div>
            <span className="font-headline-lg text-[28px] text-on-surface font-light">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Por Categoria */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded p-4">
        <h2 className="font-title-sm text-[15px] font-medium text-on-surface mb-4">Chamados por Categoria</h2>
        <div className="space-y-3">
          {stats.porCategoria.map((cat) => {
            const pct = stats.total ? Math.round((cat.count / stats.total) * 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-on-surface">{cat.nome}</span>
                  <span className="text-on-surface-variant">{cat.count} ({pct}%)</span>
                </div>
                <div className="w-full bg-surface-container-highest/50 rounded-full h-1.5">
                  <div className="bg-primary/80 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent closed */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded p-4">
        <h2 className="font-title-sm text-[15px] font-medium text-on-surface mb-4">Últimos Chamados Concluídos</h2>
        <div className="space-y-2">
          {tickets.filter((t) => t.status_id === concluidoId).slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-primary/60">check_circle</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-on-surface truncate">{t.assunto}</p>
                  <p className="text-[11px] text-on-surface-variant">#{t.codigo} · {getCategoryName(t.categoria_id)}</p>
                </div>
              </div>
              <span className="text-[11px] text-on-surface-variant whitespace-nowrap ml-2">
                {t.data_fechamento ? new Date(t.data_fechamento).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
          ))}
          {!tickets.some((t) => t.status_id === concluidoId) && (
            <p className="text-center text-on-surface-variant text-[13px] py-4">Nenhum chamado concluído ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
