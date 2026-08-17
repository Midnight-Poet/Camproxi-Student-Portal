import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { Icon } from './Icon.jsx';
import { useGetMeQuery, useGetSchoolByIdQuery, useGetChatsQuery, useGetNotificationsQuery } from '../store/apiSlice';
import { useNotificationSocket } from '../hooks/useNotificationSocket.js';

const getIconForNotification = (notif) => {
  const type = (notif?.type || '').toLowerCase();
  const category = (notif?.category || '').toUpperCase();

  if (category === 'NEW_MESSAGE' || type === 'message') {
    return { name: 'chat_bubble', color: '#7c6cf0', bg: '#f0effd' };
  }
  if (category === 'REQUEST_CREATED' || category === 'REQUEST_UPDATED' || type === 'request_update') {
    return { name: 'receipt_long', color: '#14b8a6', bg: '#e2f7f3' };
  }
  if (category === 'REVIEW_CREATED' || type === 'review') {
    return { name: 'star', color: '#f59e0b', bg: '#fffbeb' };
  }
  if (type === 'promo' || type === 'match') {
    return { name: 'local_offer', color: '#ec4899', bg: '#fdf2f8' };
  }
  if (type === 'alert' || type === 'system') {
    return { name: 'warning', color: '#ef4444', bg: '#fee2e2' };
  }
  return { name: 'notifications', color: '#5b6270', bg: '#f4f5f7' };
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return mins <= 1 ? 'Just now' : `${mins}m ago`;
  }
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const NAV_TABS = [
  { path: '/home',     label: 'Home',     icon: 'home' },
  { path: '/explore',  label: 'Explore',  icon: 'explore' },
  { path: '/saved',    label: 'Saved',    icon: 'bookmark' },
  { path: '/activity', label: 'Activity', icon: 'receipt_long' },
];

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();

  const { data: userResponse } = useGetMeQuery();
  const user = userResponse?.data || userResponse;

  // Fetch school info from /api/admin/school/:schoolId
  const { data: schoolRes, isLoading: isLoadingSchool } = useGetSchoolByIdQuery(
    user?.schoolId,
    { skip: !user?.schoolId }
  );
  const school = schoolRes?.data || schoolRes;
  const schoolName = school ? `${school.code} ${school.campus?.[0]?.name || ''}`.trim() : null;

  // Notifications
  const { data: notifRes } = useGetNotificationsQuery();
  const rawNotifications = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
  const unreadCount = rawNotifications.filter(n => !n.isRead).length;
  const latestNotifications = rawNotifications.slice(0, 4);

  const { markAsRead } = useNotificationSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    setIsNotifOpen(false);
    if (!notif.isRead) {
      markAsRead(notif.id || notif._id);
    }
    if (notif.category === 'NEW_MESSAGE' || notif.type === 'message') {
      navigate('/messages');
    } else if (notif.category === 'REQUEST_CREATED' || notif.category === 'REQUEST_UPDATED' || notif.type === 'request_update') {
      navigate('/activity');
    } else if ((notif.category === 'REVIEW_CREATED' || notif.type === 'review') && notif.itemId) {
      navigate(`/listing/${notif.itemId}`);
    } else if (notif.type === 'promo' || notif.type === 'match') {
      navigate('/explore');
    } else if (notif.type === 'alert' || notif.type === 'system') {
      navigate('/profile');
    } else if (notif.itemId) {
      navigate(`/listing/${notif.itemId}`);
    }
  };

  // Unread Messages Count
  const { data: chatsRes } = useGetChatsQuery();
  const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);
  
  const totalUnread = chats.reduce((sum, chat) => {
    let unread = chat.unreadCount;
    if (unread === undefined) {
      unread = (chat.messages || []).filter(m => m.senderType === 'AGENT' && !m.isRead).length;
    }
    return sum + (unread || 0);
  }, 0);

  const initial = (user?.firstName || 'U').charAt(0).toUpperCase();

  return (
    <header className="hidden md:block sticky top-4 z-[50] px-4 md:px-10 pointer-events-none">
      <div
        className="max-w-[1440px] mx-auto pointer-events-auto flex items-center justify-between h-[68px] px-3 pr-3"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(235,237,240,0.9)',
          borderRadius: 22,
          boxShadow: '0 4px 24px rgba(20,184,166,0.06), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* ── Left: Menu + Logo ── */}
        <div className="flex items-center gap-3 flex-none">
          {/* Hamburger (tablet only) */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
            onClick={() => dispatch({ type: 'TOGGLE_SIDENAV' })}
          >
            <Icon name="menu" size={24} style={{ color: '#42474f' }} />
          </button>

          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => navigate('/home')}
          >
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center font-extrabold text-white text-[15px] tracking-tighter transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #7c6cf0 100%)',
                boxShadow: '0 4px 12px rgba(20,184,166,0.35)',
              }}
            >
              CX
            </div>
            <span
              className="font-extrabold text-[20px] tracking-tight hidden lg:inline"
              style={{
                background: 'linear-gradient(120deg, #1f2430 30%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Camproxi
            </span>
          </div>
        </div>

        {/* ── Center: Nav tabs ── */}
        <nav
          className="hidden lg:flex items-center gap-1 p-1 rounded-2xl flex-none"
          style={{ background: 'rgba(241,243,245,0.8)' }}
        >
          {NAV_TABS.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-bold border-none cursor-pointer transition-all duration-200 select-none"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #14b8a6, #0c8c81)'
                    : 'transparent',
                  color: active ? '#fff' : '#5b6270',
                  boxShadow: active ? '0 3px 10px rgba(20,184,166,0.3)' : 'none',
                  transform: active ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon
                  name={tab.icon}
                  size={17}
                  fill={active ? 1 : 0}
                  style={{ color: 'inherit' }}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-2 flex-none">

          {/* Campus badge */}
          <div
            className="hidden xl:flex items-center gap-1.5 h-9 px-3.5 rounded-2xl cursor-default transition-all select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(124,108,240,0.08))',
              border: '1px solid rgba(20,184,166,0.20)',
            }}
          >
            <Icon name="school" size={14} fill={1} style={{ color: '#0d9488' }} />
            {isLoadingSchool ? (
              <span className="inline-block w-24 h-3 rounded-full animate-pulse" style={{ background: 'rgba(20,184,166,0.25)' }} />
            ) : (
              <span
                className="text-[11.5px] font-extrabold tracking-wide whitespace-nowrap"
                style={{ color: '#0d9488' }}
              >
                {user?.school || schoolName || state.prefs.campus}
              </span>
            )}
          </div>

          {/* Thin divider */}
          <div className="hidden xl:block h-5 w-px mx-1" style={{ background: 'rgba(0,0,0,0.08)' }} />

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
              style={{ background: isNotifOpen ? 'rgba(241,243,245,0.9)' : 'transparent' }}
              onMouseEnter={e => { if (!isNotifOpen) e.currentTarget.style.background = 'rgba(241,243,245,0.9)'; }}
              onMouseLeave={e => { if (!isNotifOpen) e.currentTarget.style.background = 'transparent'; }}
              title="Notifications"
            >
              <Icon name="notifications" size={20} style={{ color: '#5b6270' }} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-[1.5px] border-white"
                  style={{ background: '#14b8a6' }}
                />
              )}
            </button>

            {/* Dropdown */}
            {isNotifOpen && (
              <div 
                className="absolute right-0 top-[52px] w-[350px] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_24px_54px_rgba(0,0,0,0.16)] border border-white/60 overflow-hidden z-[100] origin-top-right transition-all duration-300"
                style={{ animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {/* Add dynamic animation stylesheet injection if not present */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.96) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                  }
                `}} />

                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/40">
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] text-white rounded-full shadow-sm">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  {latestNotifications.length === 0 ? (
                    <div className="py-10 text-center px-4 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Icon name="notifications_off" size={22} style={{ color: '#9aa0ab' }} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No new notifications received.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {latestNotifications.map((notif) => {
                        const { name: iconName, color, bg } = getIconForNotification(notif);
                        const isUnread = !notif.isRead;
                        return (
                          <div 
                            key={notif.id || notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 border-b border-slate-50/80 cursor-pointer transition-all duration-200 flex gap-3.5 hover:bg-slate-50/60 relative ${
                              isUnread 
                                ? 'bg-gradient-to-r from-[#14b8a6]/[0.03] to-transparent border-l-2 border-l-[#14b8a6]' 
                                : 'bg-transparent'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-none shadow-inner border border-white" style={{ backgroundColor: bg }}>
                              <Icon name={iconName} size={18} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className={`text-sm truncate ${isUnread ? 'font-extrabold text-slate-800' : 'font-semibold text-slate-600'}`}>
                                {notif.title || 'Notification'}
                              </p>
                              <p className={`text-[12.5px] truncate mt-0.5 ${isUnread ? 'font-bold text-slate-600' : 'text-slate-450 font-medium'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] font-bold text-[#14b8a6] mt-1.5 flex items-center gap-1">
                                <Icon name="schedule" size={10} style={{ color: 'inherit' }} />
                                {formatTime(notif.createdAt)}
                              </p>
                            </div>
                            {isUnread && (
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff5e62] to-[#ff9966] mt-2 shadow-sm animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-3.5 border-t border-slate-100 bg-white/50">
                  <button 
                    className="w-full py-2.5 rounded-2xl text-xs font-extrabold text-white text-center cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md flex items-center justify-center gap-2 border-none"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/notifications');
                    }}
                  >
                    <span>View all notifications</span>
                    <Icon name="arrow_forward" size={14} style={{ color: 'white' }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <button
            onClick={() => navigate('/messages')}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer border-none transition-all duration-200 group"
            style={{ background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,243,245,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Messages"
          >
            <Icon name="chat_bubble" size={20} style={{ color: '#5b6270' }} />
            {totalUnread > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] rounded-full text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white/90 px-0.5"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
              >
                {totalUnread}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="relative flex-none w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-extrabold cursor-pointer border-none transition-all duration-200 hover:scale-110"
            style={{
              background: user?.profileImage?.url
                ? 'transparent'
                : 'linear-gradient(135deg, #14b8a6, #7c6cf0)',
              boxShadow: '0 0 0 2px white, 0 0 0 3.5px rgba(20,184,166,0.5)',
            }}
            title="Profile"
          >
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </button>
        </div>
      </div>
    </header>
  );
}