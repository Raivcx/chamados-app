import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

export default function TopBar({ onMenuToggle }) {
  const { user, profile, logout } = useAuth();
  const { helpInfo, notifications, markNotificationAsRead } = useApp();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userRef = useRef(null);
  const helpRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications ? notifications.filter((n) => !n.lida).length : 0;

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const initials = profile?.nome
    ? profile.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="bg-surface-container/50 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-4 lg:px-container-padding py-2 w-full h-14 lg:h-16 shrink-0 z-30 relative">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center flex-1 gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div className="hidden sm:flex items-center flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">search</span>
          <input
            className="w-full bg-surface-container-highest/50 border border-outline-variant/20 rounded py-1.5 pl-9 pr-4 font-body-sm text-[13px] text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
            placeholder="Buscar chamados, IDs ou equipamentos..."
            type="text"
          />
        </div>
      </div>

      {/* Center: Brand */}
      <div className="hidden lg:flex flex-1 justify-center">
        <span className="font-headline-sm text-[16px] font-semibold text-on-surface opacity-90 tracking-wide">
          TechSupport Pro
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 justify-end flex-1">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
            )}
          </button>
          
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-outline-variant/30 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-on-surface">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{unreadCount} novas</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-on-surface-variant text-[12px]">Nenhuma notificação</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (!n.lida) markNotificationAsRead(n.id);
                        if (n.ticket_id) {
                          setNotifOpen(false);
                          navigate(`/chamados/${n.ticket_id}`);
                        }
                      }}
                      className={`p-3 border-b border-outline-variant/10 last:border-0 cursor-pointer hover:bg-surface-container-highest transition-colors ${!n.lida ? 'bg-primary/5' : ''}`}
                    >
                      <p className="text-[12px] font-medium text-on-surface mb-0.5">{n.titulo}</p>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2">{n.mensagem}</p>
                      <p className="text-[10px] text-on-surface-variant/50 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="p-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          {helpOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-lg p-4 z-50">
              <h3 className="font-title-sm text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                Informações de Ajuda
              </h3>
              <p className="text-on-surface-variant text-[13px] mb-3">{helpInfo.texto}</p>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">mail</span>
                  <a href={`mailto:${helpInfo.email}`} className="hover:text-primary transition-colors">{helpInfo.email}</a>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  <span>{helpInfo.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">language</span>
                  <a href={helpInfo.site} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">{helpInfo.site}</a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative ml-2 pl-3 border-l border-outline-variant/40 h-6 flex items-center" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.nome} className="w-7 h-7 rounded-full border border-outline-variant/50 object-cover group-hover:border-primary/50 transition-colors" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-[10px] font-bold text-on-surface-variant group-hover:border-primary/50 transition-colors">
                {initials}
              </div>
            )}
            <span className="hidden md:block text-[13px] text-on-surface-variant group-hover:text-on-surface transition-colors">
              {profile?.nome?.split(' ')[0]}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-48 bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="text-[13px] font-medium text-on-surface truncate">{profile?.nome}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{profile?.email}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); navigate('/perfil'); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Perfil do Usuário
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center gap-2 border-t border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
