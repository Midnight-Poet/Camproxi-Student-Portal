import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { useApp } from '../context.jsx';
import { apiSlice } from '../store/apiSlice';

// Singleton socket instance for the `/notifications` namespace
let socket = null;
let connectionCount = 0;

export function useNotificationSocket() {
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const dispatch = useDispatch();
  const { showToast } = useApp();
  const showToastRef = useRef(showToast);

  // Keep ref updated
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    setIsConnected(socket?.connected || false);

    // Only initialize socket if it doesn't exist
    if (!socket) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

      socket = io(`${backendUrl}/notifications`, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[NotificationSocket] Connected');
        setIsConnected(true);
      });

      socket.on('newNotification', (payload) => {
        try {
          const notification = payload.data || payload;
          
          // Optimistically update the RTK Query cache for getNotifications
          dispatch(
            apiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
              const arr = Array.isArray(draft) ? draft : (draft.data || []);
              // Ensure we don't duplicate notifications
              const exists = arr.some(n => n.id === notification.id || n._id === notification._id);
              if (!exists) {
                arr.unshift(notification); // Add to the top
              }
            })
          );
          
          showToastRef.current(
            notification.message || 'New notification received!', 
            { 
              position: 'top', 
              type: 'notification',
              title: notification.title || 'New Notification'
            }
          );

        } catch (err) {
          console.error('[NotificationSocket] Error parsing notification:', err);
        }
      });

      socket.on('notificationRead', (payload) => {
        try {
          const { notificationId } = payload;
          
          // Update notification in the cache to be read
          dispatch(
            apiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
              const arr = Array.isArray(draft) ? draft : (draft.data || []);
              const notif = arr.find(n => (n.id || n._id) === notificationId);
              if (notif) {
                notif.isRead = true;
              }
            })
          );
        } catch (err) {
          console.error('[NotificationSocket] Error handling notificationRead', err);
        }
      });

      socket.on('allNotificationsRead', () => {
        try {
          // Update all notifications in the cache to be read
          dispatch(
            apiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
              const arr = Array.isArray(draft) ? draft : (draft.data || []);
              arr.forEach(n => {
                n.isRead = true;
              });
            })
          );
        } catch (err) {
          console.error('[NotificationSocket] Error handling allNotificationsRead', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('[NotificationSocket] Disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('[NotificationSocket] Connection Error:', err);
      });
    }

      connectionCount++;

      return () => {
        connectionCount--;
        if (connectionCount === 0 && socket) {
          socket.disconnect();
          socket = null;
        }
      };
  }, [dispatch]);

  const markAsRead = useCallback((notificationId) => {
    if (socket?.connected) {
      socket.emit('markAsRead', { notificationId });
      // Optimistically update
      dispatch(
        apiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
          const arr = Array.isArray(draft) ? draft : (draft.data || []);
          const notif = arr.find(n => (n.id || n._id) === notificationId);
          if (notif) {
            notif.isRead = true;
          }
        })
      );
    } else {
      console.log('[NotificationSocket] Socket not connected, falling back to HTTP API');
      dispatch(apiSlice.endpoints.markNotificationRead.initiate(notificationId));
    }
  }, [dispatch]);

  const markAllAsRead = useCallback(() => {
    if (socket?.connected) {
      socket.emit('markAllAsRead', {});
      // Optimistically update
      dispatch(
        apiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
          const arr = Array.isArray(draft) ? draft : (draft.data || []);
          arr.forEach(n => {
            n.isRead = true;
          });
        })
      );
    } else {
      console.log('[NotificationSocket] Socket not connected, falling back to HTTP API');
      dispatch(apiSlice.endpoints.markAllNotificationsRead.initiate());
    }
  }, [dispatch]);

  return { isConnected, markAsRead, markAllAsRead };
}
