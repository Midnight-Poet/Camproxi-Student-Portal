import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { Icon } from './Icon.jsx';

const NAV_TABS = [
  { path: '/home',     label: 'Home',     icon: 'home' },
  { path: '/explore',  label: 'Explore',  icon: 'explore' },
  { path: '/saved',    label: 'Saved',    icon: 'bookmark' },
  { path: '/activity', label: 'Activity', icon: 'receipt_long' },
];

export function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();

  return (
    <div className="hidden md:block lg:hidden">
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-[#1f2430]/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${state.isSideNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch({ type: 'TOGGLE_SIDENAV' })}
      />
      
      {/* Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[80] transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col py-8 ${state.isSideNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              C
            </div>
            <span className="font-extrabold text-cx-ink text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
              Camproxi
            </span>
          </div>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_SIDENAV' })}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cx-bg border-none bg-transparent cursor-pointer transition-colors"
          >
            <Icon name="close" size={20} style={{ color: '#5b6270' }} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-2 px-4">
          {NAV_TABS.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => {
                  navigate(tab.path);
                  dispatch({ type: 'TOGGLE_SIDENAV' });
                }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 border-none outline-none ${
                  active 
                    ? 'bg-cx-ink text-white shadow-[0_4px_12px_rgba(31,36,48,0.15)]' 
                    : 'bg-transparent text-cx-muted hover:bg-cx-border/30 hover:text-cx-ink'
                }`}
              >
                <div className="flex-none flex items-center justify-center w-6">
                  <Icon 
                    name={tab.icon} 
                    size={22} 
                    fill={active ? 1 : 0} 
                    style={{ color: active ? '#fff' : 'inherit' }} 
                  />
                </div>
                <span className="font-bold text-[15px] whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
