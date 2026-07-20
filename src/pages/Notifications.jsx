import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { Icon } from '../components/Icon.jsx';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation 
} from '../store/apiSlice';

export function Notifications() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const { data: notificationsRes, isLoading, refetch } = useGetNotificationsQuery();
  const notifications = Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes?.data || []);
  
  const [markRead, { isLoading: isMarkingRead }] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsReadMutation();

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markRead(id).unwrap();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead().unwrap();
      showToast('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read', err);
      showToast('Could not mark all as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markRead(notif.id || notif._id).unwrap();
      } catch (err) {
        // ignore silently on navigation
      }
    }
    // Depending on notification type, we could navigate differently
    // For now, if there's an itemId, go there, otherwise maybe just stay
    if (notif.itemId) {
      navigate(`/listing/${notif.itemId}`);
    } else if (notif.type === 'message') {
      navigate('/messages');
    }
  };

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-0 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
            Notifications
          </h1>
          <p className="text-sm text-cx-muted mt-1 font-medium">
            You have <span className="font-bold text-cx-teal">{unreadCount}</span> unread messages
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-cx-border rounded-xl text-sm font-bold text-cx-ink shadow-sm cursor-pointer hover:bg-cx-bg transition-colors disabled:opacity-50"
          >
            <Icon name="done_all" size={18} style={{ color: '#14b8a6' }} />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-cx-border animate-pulse shadow-sm" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cx-border shadow-sm text-center px-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center mb-6 shadow-inner border border-white">
            <Icon name="notifications_off" size={32} style={{ color: '#9aa0ab' }} />
          </div>
          <h3 className="text-xl font-bold text-cx-ink mb-2">You're all caught up!</h3>
          <p className="text-sm text-cx-muted max-w-xs leading-relaxed">
            There are no new notifications at this time. Check back later for updates.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="mt-8 px-6 py-3 rounded-xl font-bold text-white shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-24 md:mb-12">
          {unreadCount > 0 && (
            <div className="md:hidden flex justify-end mb-4">
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="text-xs font-bold text-cx-teal flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                <Icon name="done_all" size={16} />
                Mark all as read
              </button>
            </div>
          )}
          
          {notifications.map(notif => {
            const { name: iconName, color, bg } = getIconForType(notif.type);
            const isUnread = !notif.isRead;
            
            return (
              <div 
                key={notif.id || notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`relative overflow-hidden group cursor-pointer transition-all duration-300 rounded-2xl p-5 border ${
                  isUnread 
                    ? 'bg-gradient-to-br from-white to-[#f8fafc] border-[#14b8a6]/20 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.1)] hover:shadow-md' 
                    : 'bg-white border-cx-border shadow-sm hover:border-cx-border/80 hover:shadow'
                }`}
              >
                {/* Unread indicator line */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#14b8a6] to-[#7c6cf0]" />
                )}
                
                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-none shadow-sm border border-white"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon name={iconName} size={22} style={{ color }} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-base truncate ${isUnread ? 'font-extrabold text-cx-ink' : 'font-bold text-cx-ink3'}`}>
                        {notif.title || 'New Notification'}
                      </h4>
                      <span className={`text-xs flex-none ${isUnread ? 'font-bold text-cx-teal' : 'font-medium text-cx-muted'}`}>
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isUnread ? 'font-medium text-cx-ink4' : 'text-cx-muted'}`}>
                      {notif.message}
                    </p>
                  </div>
                  
                  {/* Mark as read button (only visible on hover for unread) */}
                  {isUnread && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id || notif._id, e)}
                      disabled={isMarkingRead}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-cx-border shadow flex items-center justify-center cursor-pointer hover:bg-cx-bg hover:scale-110"
                      title="Mark as read"
                    >
                      <Icon name="check" size={16} style={{ color: '#14b8a6' }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
