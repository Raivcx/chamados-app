import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { MOCK_HELP_INFO } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState({ titulo: 'Suporte Técnico', subtitulo: 'Operacional' });
  const [loadingData, setLoadingData] = useState(true);

  // Fetch all lookup data on mount
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      const [catRes, statRes, priRes, usersRes, settingsRes, ticketsRes] = await Promise.all([
        supabase.from('categories').select('*').order('nome'),
        supabase.from('statuses').select('*').order('ordem'),
        supabase.from('priorities').select('*').order('ordem'),
        supabase.from('profiles').select('*').order('nome'),
        supabase.from('system_settings').select('*').limit(1).single(),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (statRes.data) setStatuses(statRes.data);
      if (priRes.data) setPriorities(priRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (settingsRes.data) setSystemSettings(settingsRes.data);
      if (ticketsRes.data) setTickets(ticketsRes.data);

      if (user) {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (notifData) setNotifications(notifData);
      }

      // Fetch all comments for all tickets
      if (ticketsRes.data) {
        const ticketIds = ticketsRes.data.map((t) => t.id);
        if (ticketIds.length > 0) {
          const { data: allComments } = await supabase
            .from('comments')
            .select('*')
            .in('ticket_id', ticketIds)
            .order('created_at', { ascending: true });

          if (allComments) {
            const grouped = {};
            allComments.forEach((c) => {
              if (!grouped[c.ticket_id]) grouped[c.ticket_id] = [];
              grouped[c.ticket_id].push(c);
            });
            setComments(grouped);
          }
        }
      }
      setLoadingData(false);
    };

    fetchData();
  }, [user]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const ticketsSub = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
        } else if (payload.eventType === 'DELETE') {
          setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const commentsSub = supabase
      .channel('comments-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
        setComments((prev) => ({
          ...prev,
          [payload.new.ticket_id]: [...(prev[payload.new.ticket_id] || []), payload.new],
        }));
      })
      .subscribe();

    const notifSub = supabase
      .channel('notifs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `usuario_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? payload.new : n)));
        } else if (payload.eventType === 'DELETE') {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSub);
      supabase.removeChannel(commentsSub);
      supabase.removeChannel(notifSub);
    };
  }, [user]);

  const markNotificationAsRead = useCallback(async (notifId) => {
    const { error } = await supabase.from('notifications').update({ lida: true }).eq('id', notifId);
    if (!error) {
      setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, lida: true } : n));
    }
  }, []);

  const addTicket = useCallback(async (ticketData) => {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        assunto: ticketData.assunto,
        descricao: ticketData.descricao,
        categoria_id: ticketData.categoria_id || null,
        prioridade_id: ticketData.prioridade_id || null,
        status_id: ticketData.status_id,
        criado_por: ticketData.criado_por,
        atribuido_a: ticketData.atribuido_a || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar ticket:', error);
      return null;
    }

    // Criar comentário de abertura
    if (data && ticketData.descricao) {
      await supabase.from('comments').insert({
        ticket_id: data.id,
        usuario_id: ticketData.criado_por,
        texto: ticketData.descricao,
        tipo: 'abertura',
      });
    }

    return data;
  }, []);

  const updateTicket = useCallback(async (id, updates) => {
    const updateData = { ...updates };

    // Se concluindo, definir data_fechamento
    if (updates.status_id) {
      const statusConcluido = statuses.find((s) => s.nome === 'Concluído');
      if (statusConcluido && updates.status_id === statusConcluido.id) {
        updateData.data_fechamento = new Date().toISOString();
      }
      // Se reabrindo, limpar data_fechamento
      if (statusConcluido && updates.status_id !== statusConcluido.id) {
        const currentTicket = tickets.find((t) => t.id === id);
        if (currentTicket?.data_fechamento) {
          updateData.data_fechamento = null;
        }
      }
    }

    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar ticket:', error);
      return false;
    }

    // Atualização local imediata (realtime fará sync)
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updateData } : t)));
    return true;
  }, [statuses, tickets]);

  const addComment = useCallback(async (ticketId, userId, texto, userCargo, anexoUrl = null) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        usuario_id: userId,
        texto,
        tipo: 'resposta',
        anexo_url: anexoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      return null;
    }

    // Automação de status
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const statusConcluido = statuses.find((s) => s.nome === 'Concluído');
      if (ticket.status_id !== statusConcluido?.id) {
        if (userCargo === 'tecnico' || userCargo === 'admin') {
          const aguardandoCliente = statuses.find((s) => s.nome === 'Aguardando Cliente');
          const statusAberto = statuses.find((s) => s.nome === 'Aberto');
          const statusProgresso = statuses.find((s) => s.nome === 'Em Progresso');
          const aguardandoSuporte = statuses.find((s) => s.nome === 'Aguardando Suporte');

          if ([statusAberto?.id, statusProgresso?.id, aguardandoSuporte?.id].includes(ticket.status_id)) {
            if (aguardandoCliente) {
              await updateTicket(ticketId, { status_id: aguardandoCliente.id });
            }
          }
        } else if (userCargo === 'cliente') {
          const aguardandoSuporte = statuses.find((s) => s.nome === 'Aguardando Suporte');
          if (aguardandoSuporte) {
            await updateTicket(ticketId, { status_id: aguardandoSuporte.id });
          }
        }
      }
    }

    // Atualização local imediata
    setComments((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), data],
    }));

    return data;
  }, [tickets, statuses, updateTicket]);

  const getComments = useCallback((ticketId) => comments[ticketId] || [], [comments]);

  const deleteAllTickets = useCallback(async () => {
    const { error } = await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      setTickets([]);
      setComments({});
    }
    return !error;
  }, []);

  const getCategoryName = useCallback((id) => categories.find((c) => c.id === id)?.nome || '—', [categories]);
  const getStatusObj = useCallback((id) => statuses.find((s) => s.id === id) || null, [statuses]);
  const getPriorityObj = useCallback((id) => priorities.find((p) => p.id === id) || null, [priorities]);
  const getUserName = useCallback((id) => users.find((u) => u.id === id)?.nome || 'Não atribuído', [users]);
  const getUserObj = useCallback((id) => users.find((u) => u.id === id) || null, [users]);

  return (
    <AppContext.Provider value={{
      tickets, addTicket, updateTicket, deleteAllTickets,
      comments, addComment, getComments,
      notifications, markNotificationAsRead,
      categories, setCategories, statuses, priorities, users, setUsers,
      helpInfo: MOCK_HELP_INFO, systemSettings, setSystemSettings,
      getCategoryName, getStatusObj, getPriorityObj, getUserName, getUserObj,
      loadingData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
