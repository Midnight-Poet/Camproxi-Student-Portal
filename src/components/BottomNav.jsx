import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './Icon.jsx';

const TABS = [
  { path: '/home',     icon: 'home',          label: 'Home'     },
  { path: '/explore',  icon: 'explore',        label: 'Explore'  },
  { path: '/saved',    icon: 'bookmark',       label: 'Saved'    },
  { path: '/activity', icon: 'receipt_long',   label: 'Activity' },
  { path: '/profile',  icon: 'person',         label: 'Profile'  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav 
      className="fixed z-40 md:hidden left-4 right-4 bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-3xl"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-end justify-around px-2 py-2.5">
        {TABS.map(tab => {
          // Check if current path starts with tab path (so /explore/123 still highlights Explore)
          const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex-1 flex flex-col items-center justify-end h-12 gap-1 border-none bg-transparent cursor-pointer group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Animated Pill Background */}
              <div 
                className={`absolute top-0 w-14 h-8 rounded-full transition-all duration-300 ease-out ${
                  active 
                    ? 'bg-[#e2f7f3] scale-100 opacity-100' 
                    : 'bg-transparent scale-95 opacity-0 group-hover:bg-slate-100 group-hover:opacity-100'
                }`}
              />
              
              {/* Icon Container with jump animation */}
              <div className={`relative z-10 transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                active ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100 group-active:scale-90'
              }`}>
                <Icon
                  name={tab.icon}
                  size={24}
                  fill={active ? 1 : 0}
                  style={{ color: active ? '#0d9488' : '#9aa0ab' }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-extrabold tracking-wide transition-all duration-300 ease-out ${
                  active ? 'text-[#0d9488] opacity-100' : 'text-[#9aa0ab] opacity-60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
