import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { useGetNotificationsQuery, useGetChatsQuery } from '../store/apiSlice';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch unread counts for badges in the menu
  const { data: notifRes } = useGetNotificationsQuery();
  const rawNotifications = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
  const unreadNotifs = rawNotifications.filter(n => !n.isRead).length;

  const { data: chatsRes } = useGetChatsQuery();
  const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);
  const unreadChats = chats.reduce((sum, chat) => {
    let unread = chat.unreadCount;
    if (unread === undefined) {
      unread = (chat.messages || []).filter(m => m.senderType === 'AGENT' && !m.isRead).length;
    }
    return sum + (unread || 0);
  }, 0);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // If menu is open, prevent body scroll
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const MAIN_LEFT = [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/explore', icon: 'explore', label: 'Explore' },
  ];

  const MAIN_RIGHT = [
    { path: '/saved', icon: 'bookmark', label: 'Saved' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  const MENU_ITEMS = [
    { path: '/activity', icon: 'receipt_long', label: 'Activity', color: '#8b5cf6', bg: '#f5f3ff' },
    { path: '/messages', icon: 'chat_bubble', label: 'Messages', badge: unreadChats, color: '#ec4899', bg: '#fdf2f8' },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: unreadNotifs, color: '#f59e0b', bg: '#fffbeb' },
    { path: '/settings', icon: 'settings', label: 'Settings', color: '#64748b', bg: '#f1f5f9' },
  ];

  const renderTab = (tab) => {
    const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
    return (
      <button
        key={tab.path}
        onClick={() => navigate(tab.path)}
        className="relative flex-1 flex flex-col items-center justify-end h-12 gap-1 border-none bg-transparent cursor-pointer group"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div 
          className={`absolute top-0 w-12 h-8 rounded-full transition-all duration-300 ease-out ${
            active ? 'bg-[#e2f7f3] scale-100 opacity-100' : 'bg-transparent scale-95 opacity-0'
          }`}
        />
        <div className={`relative z-10 transition-all duration-300 ${active ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100'}`}>
          <Icon name={tab.icon} size={24} fill={active ? 1 : 0} style={{ color: active ? '#0d9488' : '#9aa0ab' }} />
        </div>
        <span className={`text-[10px] font-extrabold tracking-wide transition-all duration-300 ${
          active ? 'text-[#0d9488] opacity-100' : 'text-[#9aa0ab] opacity-60'
        }`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Backdrop for the menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Floating Menu */}
      <div 
        className={`fixed left-4 right-4 bg-white rounded-3xl p-5 z-[95] shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ bottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
      >
        <div className="grid grid-cols-2 gap-4">
          {MENU_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => {
                setMenuOpen(false);
                navigate(item.path);
              }}
              className="flex items-center gap-3 p-3 rounded-2xl border-none bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-none" style={{ backgroundColor: item.bg }}>
                <Icon name={item.icon} size={20} style={{ color: item.color }} />
              </div>
              <div className="flex-1 font-bold text-sm text-slate-800">
                {item.label}
              </div>
              {item.badge > 0 && (
                <div className="flex-none bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav 
        className="fixed z-[100] md:hidden left-4 right-4 bg-white/90 backdrop-blur-xl border border-white shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-3xl"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end justify-between px-2 py-2.5 relative">
          
          <div className="flex flex-1 justify-around">
            {MAIN_LEFT.map(renderTab)}
          </div>

          {/* Center FAB */}
          <div className="flex-none w-[68px] flex justify-center -translate-y-3 relative z-10">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-transform duration-300 ${
                menuOpen ? 'rotate-45' : 'rotate-0'
              }`}
              style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
            >
              <Icon name="add" size={32} style={{ color: 'white' }} />
            </button>
            {/* Unread dot indicator on the + button if there are unseen notifications/chats */}
            {!menuOpen && (unreadNotifs > 0 || unreadChats > 0) && (
              <div className="absolute top-0 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            )}
          </div>

          <div className="flex flex-1 justify-around">
            {MAIN_RIGHT.map(renderTab)}
          </div>

        </div>
      </nav>
    </>
  );
}
