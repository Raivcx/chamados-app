import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function DetalhesChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tickets, updateTicket, getStatusObj, getPriorityObj,
    getCategoryName, getUserName, getUserObj,
    statuses, priorities, users, categories,
    addComment, getComments
  } = useApp();
  const { user, profile, isAdmin, isTecnico, isCliente } = useAuth();

  const ticket = useMemo(() => tickets.find((t) => t.id === id), [tickets, id]);
  const comentarios = getComments(id);
  const [texto, setTexto] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [sending, setSending] = useState(false);
  const [updatingField, setUpdatingField] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comentarios.length]);

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 block mb-4">search_off</span>
        <h2 className="text-on-surface text-lg font-bold mb-2">Chamado não encontrado</h2>
        <p className="text-on-surface-variant text-[13px] mb-4">O chamado <code className="bg-surface-container px-1 rounded">#{id}</code> não existe ou foi removido.</p>
        <button onClick={() => navigate('/chamados')} className="text-primary hover:underline text-[14px]">← Voltar para Chamados</button>
      </div>
    );
  }

  const statusAtual = getStatusObj(ticket.status_id);
  const prioridadeAtual = getPriorityObj(ticket.prioridade_id);
  const statusConcluido = statuses.find((s) => s.nome === 'Concluído');
  const statusAberto = statuses.find((s) => s.nome === 'Aberto');
  const isClosed = statusConcluido && ticket.status_id === statusConcluido.id;

  const handleFieldUpdate = async (field, value) => {
    setUpdatingField(field);
    await new Promise((r) => setTimeout(r, 300));
    updateTicket(ticket.id, { [field]: value });
    const labels = { status_id: 'Status', prioridade_id: 'Prioridade', atribuido_a: 'Atribuição', categoria_id: 'Categoria' };
    toast.success(`${labels[field] || field} atualizado!`);
    setUpdatingField(null);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!texto.trim() && !arquivo || sending) return;
    setSending(true);

    let anexoUrl = null;
    if (arquivo) {
      const fileExt = arquivo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${ticket.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('anexos')
        .upload(filePath, arquivo);

      if (uploadError) {
        toast.error('Erro ao anexar arquivo.');
        setSending(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('anexos').getPublicUrl(filePath);
      anexoUrl = publicUrlData.publicUrl;
    }

    const commentText = texto.trim() || 'Anexo enviado';
    await addComment(ticket.id, user.id, commentText, profile.cargo, anexoUrl);
    
    setTexto('');
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSending(false);
    toast.success('Resposta enviada!');
  };

  const getInitials = (userId) => {
    const name = getUserName(userId);
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const tecnicos = users.filter((u) => u.cargo === 'admin' || u.cargo === 'tecnico');

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-on-surface-variant text-[13px] mb-4">
        <button onClick={() => navigate('/chamados')} className="hover:text-on-surface flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Chamados
        </button>
        <span className="opacity-50">/</span>
        <span className="font-code-mono text-primary">#{ticket.codigo}</span>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center px-3 py-1.5 rounded font-semibold text-[12px] border" style={{
            backgroundColor: `${statusAtual?.cor}20`, borderColor: `${statusAtual?.cor}40`, color: statusAtual?.cor,
          }}>
            <span className="material-symbols-outlined text-[14px] mr-1.5">flag</span>
            {statusAtual?.nome}
          </span>
          <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prioridadeAtual?.cor }} />
            <span>{prioridadeAtual?.nome}</span>
          </div>
          <span className="text-[12px] text-on-surface-variant border-l border-outline-variant/30 pl-3">
            {getCategoryName(ticket.categoria_id)}
          </span>
        </div>
        {(isAdmin || isTecnico) && !isClosed && (
          <div className="flex gap-2">
            <button
              onClick={() => handleFieldUpdate('status_id', statusConcluido?.id)}
              disabled={updatingField === 'status_id'}
              className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded text-[12px] font-medium hover:bg-green-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Concluir
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== COLUNA PRINCIPAL: Timeline ===== */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header do chamado */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
            <h1 className="font-headline-md text-[20px] font-bold text-on-surface mb-3 leading-snug">{ticket.assunto}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">person</span>
                <span>{getUserName(ticket.criado_por)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
              </div>
              {ticket.data_fechamento && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Fechado em {new Date(ticket.data_fechamento).toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline de interações */}
          <div className="space-y-0">
            <h2 className="font-title-sm text-[14px] font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">forum</span>
              Timeline ({comentarios.length})
            </h2>

            <div className="relative pl-8">
              {/* Linha vertical da timeline */}
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-outline-variant/30" />

              {comentarios.map((c, idx) => {
                const isAuthor = c.usuario_id === user?.id;
                const isFirst = idx === 0;
                const userObj = getUserObj(c.usuario_id);

                return (
                  <div key={c.id} className="relative mb-4 last:mb-0">
                    {/* Dot na timeline */}
                    <div className={`absolute -left-8 top-3 w-[11px] h-[11px] rounded-full border-2 z-10 ${
                      isFirst ? 'bg-primary border-primary/60' : 'bg-surface-container-high border-outline-variant/60'
                    }`} />

                    {/* Card da mensagem */}
                    <div className={`rounded-lg p-4 text-[13px] border transition-colors ${
                      isFirst
                        ? 'bg-surface-container border-primary/20'
                        : isAuthor
                          ? 'bg-primary/5 border-primary/15'
                          : 'bg-surface-container-low border-outline-variant/30'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isFirst ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {getInitials(c.usuario_id)}
                          </div>
                          <span className="font-semibold text-on-surface text-[12px]">{getUserName(c.usuario_id)}</span>
                          {isFirst && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">ABERTURA</span>
                          )}
                          {userObj?.cargo && !isFirst && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase font-medium">
                              {userObj.cargo}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-on-surface-variant/60 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-on-surface-variant leading-relaxed">{c.texto}</p>
                      {c.anexo_url && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/10">
                          <a href={c.anexo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[12px] font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                            Ver Anexo
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Formulário de resposta */}
          {!isClosed ? (
            <form onSubmit={handleSendReply} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">reply</span>
                <span>Responder como <b className="text-on-surface">{profile?.nome}</b></span>
              </div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2.5 px-3 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none"
                placeholder="Escreva sua resposta..."
                rows={3}
              />
              {arquivo && (
                <div className="flex items-center gap-2 mt-2 bg-surface-container-highest px-3 py-1.5 rounded text-[12px] text-on-surface w-fit border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">attach_file</span>
                  <span className="truncate max-w-[200px]">{arquivo.name}</span>
                  <button type="button" onClick={() => { setArquivo(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-2 hover:text-error transition-colors flex items-center">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setArquivo(e.target.files[0])}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                    title="Anexar arquivo"
                  >
                    <span className="material-symbols-outlined text-[20px]">attach_file</span>
                  </button>
                  <p className="text-[11px] text-on-surface-variant/50 hidden sm:block">
                    {(isTecnico || isAdmin) && 'O status será atualizado ao enviar.'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={(!texto.trim() && !arquivo) || sending}
                  className="bg-primary text-on-primary px-5 py-2 rounded text-[13px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {sending ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  {sending ? 'Enviando...' : 'Enviar Resposta'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
              <span className="material-symbols-outlined text-green-400 text-[24px] block mb-1">task_alt</span>
              <p className="text-green-400 font-medium text-[14px]">Chamado Concluído</p>
              <p className="text-on-surface-variant text-[12px] mt-1">
                Fechado em {new Date(ticket.data_fechamento).toLocaleString('pt-BR')}
              </p>
              {(isAdmin || isTecnico) && (
                <button
                  onClick={() => handleFieldUpdate('status_id', statusAberto?.id)}
                  className="mt-3 text-[12px] text-primary hover:underline"
                >
                  Reabrir chamado
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== COLUNA LATERAL: Gerenciamento ===== */}
        <div className="space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5 space-y-5 sticky top-4">
            <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              Gerenciamento
            </h3>

            {/* Status */}
            <FieldBlock
              label="Status"
              icon="flag"
              loading={updatingField === 'status_id'}
              editable={isAdmin || isTecnico}
            >
              {(isAdmin || isTecnico) ? (
                <select
                  value={ticket.status_id}
                  onChange={(e) => handleFieldUpdate('status_id', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[13px] text-on-surface outline-none focus:border-primary/50 transition-all"
                >
                  {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              ) : (
                <StatusBadge status={statusAtual} />
              )}
            </FieldBlock>

            {/* Prioridade */}
            <FieldBlock
              label="Prioridade"
              icon="priority_high"
              loading={updatingField === 'prioridade_id'}
              editable={isAdmin}
            >
              {isAdmin ? (
                <select
                  value={ticket.prioridade_id}
                  onChange={(e) => handleFieldUpdate('prioridade_id', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[13px] text-on-surface outline-none focus:border-primary/50 transition-all"
                >
                  {priorities.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 bg-surface-container-lowest rounded border border-outline-variant/20 text-[13px] text-on-surface">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: prioridadeAtual?.cor }} />
                  {prioridadeAtual?.nome}
                </div>
              )}
            </FieldBlock>

            {/* Categoria */}
            <FieldBlock
              label="Categoria"
              icon="category"
              loading={updatingField === 'categoria_id'}
              editable={isAdmin}
            >
              {isAdmin ? (
                <select
                  value={ticket.categoria_id}
                  onChange={(e) => handleFieldUpdate('categoria_id', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[13px] text-on-surface outline-none focus:border-primary/50 transition-all"
                >
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              ) : (
                <div className="py-2 px-3 bg-surface-container-lowest rounded border border-outline-variant/20 text-[13px] text-on-surface">
                  {getCategoryName(ticket.categoria_id)}
                </div>
              )}
            </FieldBlock>

            {/* Atribuição */}
            <FieldBlock
              label="Atribuído a"
              icon="person_search"
              loading={updatingField === 'atribuido_a'}
              editable={isAdmin || isTecnico}
            >
              {(isAdmin || isTecnico) ? (
                <select
                  value={ticket.atribuido_a || ''}
                  onChange={(e) => handleFieldUpdate('atribuido_a', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded py-2 px-3 text-[13px] text-on-surface outline-none focus:border-primary/50 transition-all"
                >
                  <option value="">Não atribuído</option>
                  {tecnicos.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 bg-surface-container-lowest rounded border border-outline-variant/20 text-[13px] text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                  {getUserName(ticket.atribuido_a)}
                </div>
              )}
            </FieldBlock>

            {/* Datas */}
            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
              <InfoRow label="Criado em" value={new Date(ticket.created_at).toLocaleString('pt-BR')} icon="calendar_today" />
              {ticket.data_fechamento && (
                <InfoRow label="Fechado em" value={new Date(ticket.data_fechamento).toLocaleString('pt-BR')} icon="event_available" />
              )}
              <InfoRow label="Solicitante" value={getUserName(ticket.criado_por)} icon="person" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({ label, icon, loading, editable, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1.5 uppercase tracking-wider">
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
        {label}
        {loading && <span className="material-symbols-outlined animate-spin text-[12px] text-primary ml-auto">progress_activity</span>}
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <div className="inline-flex items-center px-2.5 py-1.5 rounded font-medium text-[12px] border" style={{
      backgroundColor: `${status.cor}15`, borderColor: `${status.cor}30`, color: status.cor,
    }}>
      {status.nome}
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-on-surface-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">{icon}</span>
        {label}
      </span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}
