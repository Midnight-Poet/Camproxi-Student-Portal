import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { Icon } from './Icon.jsx';
import { useGetMeQuery, useGetSchoolByIdQuery, useGetNotificationsQuery, useMarkNotificationReadMutation } from '../store/apiSlice';

const getIconForType = (type) => {
  switch (type) {
    case 'message': return { name: 'chat_bubble', color: '#7c6cf0', bg: '#f0effd' };
    case 'order': return { name: 'shopping_bag', color: '#14b8a6', bg: '#e2f7f3' };
    case 'alert': return { name: 'warning', color: '#f59e0b', bg: '#fef3c7' };
    default: return { name: 'notifications', color: '#5b6270', bg: '#f4f5f7' };
  }
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

  const [markRead] = useMarkNotificationReadMutation();
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
      try {
        await markRead(notif.id || notif._id).unwrap();
      } catch (err) {}
    }
    if (notif.itemId) {
      navigate(`/listing/${notif.itemId}`);
    } else if (notif.type === 'message') {
      navigate('/messages');
    }
  };

  const totalUnread = state.conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
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
              className="w-9 h-9 rounded-[12px] flex items-center justify-center font-extrabold text-white text-[17px] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #7c6cf0 100%)',
                boxShadow: '0 4px 12px rgba(20,184,166,0.35)',
              }}
            >
              C
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
              <div className="absolute right-0 top-[48px] w-[340px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-cx-border/60 overflow-hidden z-[100] animate-fadeIn">
                <div className="px-4 py-3 border-b border-cx-border/50 flex items-center justify-between bg-cx-bg/30">
                  <h3 className="font-extrabold text-cx-ink text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold text-cx-teal">{unreadCount} new</span>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  {latestNotifications.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <Icon name="notifications_off" size={24} style={{ color: '#9aa0ab', marginBottom: 8 }} />
                      <p className="text-sm font-medium text-cx-ink">No notifications</p>
                      <p className="text-xs text-cx-muted mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {latestNotifications.map((notif) => {
                        const { name: iconName, color, bg } = getIconForType(notif.type);
                        const isUnread = !notif.isRead;
                        return (
                          <div 
                            key={notif.id || notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 border-b border-cx-border/40 cursor-pointer transition-colors flex gap-3 hover:bg-cx-bg ${isUnread ? 'bg-[#14b8a6]/[0.02]' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-none" style={{ backgroundColor: bg }}>
                              <Icon name={iconName} size={18} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className={`text-sm truncate ${isUnread ? 'font-bold text-cx-ink' : 'font-semibold text-cx-ink3'}`}>
                                {notif.title || 'Notification'}
                              </p>
                              <p className={`text-xs truncate ${isUnread ? 'font-medium text-cx-ink4' : 'text-cx-muted'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] font-bold text-cx-teal mt-1">
                                {formatTime(notif.createdAt)}
                              </p>
                            </div>
                            {isUnread && (
                              <div className="w-2 h-2 rounded-full bg-cx-teal mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div 
                  className="p-3 text-center border-t border-cx-border/50 bg-cx-bg/30 hover:bg-cx-bg cursor-pointer transition-colors"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/notifications');
                  }}
                >
                  <span className="text-xs font-extrabold text-cx-teal">View all notifications</span>
                </div>
              </div>
            )}
          </div>

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
