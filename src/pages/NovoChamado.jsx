import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NovoChamado() {
  const { categories, priorities, users, statuses, addTicket } = useApp();
  const { user, isAdmin, isTecnico } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    assunto: '',
    descricao: '',
    categoria_id: '',
    prioridade_id: '3',
    atribuido_a: '',
  });
  const [saving, setSaving] = useState(false);

  const tecnicos = users.filter((u) => u.cargo === 'tecnico' || u.cargo === 'admin');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assunto.trim()) {
      toast.error('O campo Assunto é obrigatório.');
      return;
    }
    if (!form.categoria_id) {
      toast.error('Selecione uma Categoria.');
      return;
    }
    if (!form.descricao.trim()) {
      toast.error('Descreva o problema no campo Descrição.');
      return;
    }

    setSaving(true);

    const statusAberto = statuses.find((s) => s.nome === 'Aberto');
    const newTicket = await addTicket({
      ...form,
      criado_por: user.id,
      status_id: statusAberto?.id,
    });

    if (newTicket) {
      toast.success(`Chamado ${newTicket.codigo} criado com sucesso!`);
      navigate(`/chamados/${newTicket.id}`);
    } else {
      toast.error('Erro ao criar chamado. Tente novamente.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-on-surface-variant text-[13px] mb-2">
        <button onClick={() => navigate('/chamados')} className="hover:text-on-surface flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Chamados
        </button>
        <span className="opacity-50">/</span>
        <span className="text-on-surface">Novo</span>
      </div>

      <h1 className="font-headline-md text-[22px] font-bold text-on-surface">Novo Chamado</h1>

      <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 space-y-5">
        {/* Assunto */}
        <div>
          <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
            Assunto <span className="text-error">*</span>
          </label>
          <input
            name="assunto"
            value={form.assunto}
            onChange={handleChange}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
            placeholder="Ex: Computador não liga na estação 15..."
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
            Descrição <span className="text-error">*</span>
          </label>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={5}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
            placeholder="Descreva detalhadamente o problema, incluindo quando começou, o que já tentou e qualquer informação relevante..."
          />
        </div>

        {/* Categoria + Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Categoria <span className="text-error">*</span>
            </label>
            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[14px] text-on-surface outline-none focus:border-primary/50 transition-all"
            >
              <option value="">Selecione a categoria...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Prioridade
            </label>
            <select
              name="prioridade_id"
              value={form.prioridade_id}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[14px] text-on-surface outline-none focus:border-primary/50 transition-all"
            >
              {priorities.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        </div>

        {/* Atribuir a (somente técnico/admin) */}
        {(isAdmin || isTecnico) && (
          <div>
            <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Atribuir a
            </label>
            <select
              name="atribuido_a"
              value={form.atribuido_a}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[14px] text-on-surface outline-none focus:border-primary/50 transition-all"
            >
              <option value="">Não atribuído</option>
              {tecnicos.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.cargo === 'admin' ? 'Admin' : 'Técnico'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-3 border-t border-outline-variant/20">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-2.5 rounded text-[14px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Criando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Criar Chamado
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-6 py-2.5 rounded text-[14px] font-medium text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
