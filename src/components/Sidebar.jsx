import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const NAV_ITEMS = [
  { to: '/', label: 'Painel Geral', icon: 'dashboard', roles: ['admin', 'tecnico'] },
  { to: '/chamados', label: 'Meus Chamados', icon: 'assignment', roles: ['admin', 'tecnico', 'cliente'] },
  { to: '/chamados/novo', label: 'Novo Chamado', icon: 'add_circle', roles: ['admin', 'tecnico', 'cliente'] },
  { to: '/relatorios', label: 'Relatórios', icon: 'analytics', roles: ['admin', 'tecnico'] },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings_suggest', roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, logout } = useAuth();
  const { systemSettings } = useApp();

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(profile?.cargo));

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`
          bg-surface-container-lowest text-on-surface border-r border-outline-variant/40
          fixed left-0 top-0 h-screen flex flex-col pt-stack-lg pb-stack-md z-50
          w-[260px] transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="px-container-padding mb-stack-lg flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-stack-sm">
            <span className="material-symbols-outlined text-[28px] text-primary opacity-80">support_agent</span>
          </div>
          <h1 className="font-headline-md text-[20px] font-bold text-on-surface tracking-tight">
            {systemSettings.titulo}
          </h1>
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mt-1 font-medium">
            {systemSettings.subtitulo}
          </p>
        </div>

        {/* Navigation */}
        <ul className="flex-1 px-stack-sm space-y-1 overflow-y-auto mt-2">
          {filteredNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded text-[14px] cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-semibold border border-outline-variant/30 shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`
                }
              >
                <span className="material-symbols-outlined mr-3 text-[18px]">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-stack-sm mt-auto border-t border-outline-variant/30 pt-4">
          <button
            onClick={() => { logout(); onClose(); }}
            className="text-on-surface-variant font-body-md text-[14px] flex items-center px-4 py-2.5 hover:text-on-surface hover:bg-surface-container-low transition-all duration-200 rounded cursor-pointer w-full"
          >
            <span className="material-symbols-outlined mr-3 text-[18px] opacity-70">logout</span>
            Sair
          </button>
        </div>
      </nav>
    </>
  );
}
