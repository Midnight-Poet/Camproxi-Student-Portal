import { useEffect, useRef, useState, useCallback } from 'react';
import { apiSlice } from '../store/apiSlice';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

export function useChatSocket(chatId) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!chatId) {
      setIsConnected(false);
      return;
    }

    setIsConnected(false);

    // Determine WS URL from backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

    // Connect to the /chat namespace
    const socket = io(`${backendUrl}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[ChatSocket] Connected');
      setIsConnected(true);
      // Join the chat room
      socket.emit('joinChat', { chatId });
    });

    socket.on('newMessage', (payload) => {
      try {
        const message = payload.data || payload;
        
        // Optimistically update the RTK Query cache for getChatMessages
        dispatch(
          apiSlice.util.updateQueryData('getChatMessages', chatId, (draft) => {
            // Ensure we don't duplicate messages
            const exists = draft.some(m => m.id === message.id || m._id === message._id);
            if (!exists) {
              draft.push(message);
            }
          })
        );
        
        // Also update the chat list so the sidebar shows the latest message
        dispatch(
          apiSlice.util.updateQueryData('getChats', undefined, (draft) => {
            const chat = draft.find(c => (c.id || c._id) === chatId);
            if (chat) {
              chat.lastMessage = message;
              chat.updatedAt = message.createdAt || new Date().toISOString();
              // If we are not the sender, increment unread count?
              // The user said "also set up the unread number for the conversations"
              // If the message is from the agent, we can increment unread count
              if (message.senderType === 'AGENT') {
                chat.unreadCount = (chat.unreadCount || 0) + 1;
              }
            }
          })
        );
      } catch (err) {
        console.error('[ChatSocket] Error parsing message:', err);
      }
    });

    socket.on('messagesRead', (payload) => {
      try {
        const { chatId: readChatId } = payload;
        
        // Update all messages in the cache to be read
        dispatch(
          apiSlice.util.updateQueryData('getChatMessages', readChatId, (draft) => {
            draft.forEach(m => {
              // Usually we only care if OUR messages were read by the other person
              m.isRead = true;
            });
          })
        );
      } catch (err) {
        console.error('[ChatSocket] Error handling messagesRead', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('[ChatSocket] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[ChatSocket] Connection Error:', err);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [chatId, dispatch]);

  const sendMessage = useCallback((content, senderId, senderType = 'STUDENT') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', {
        chatId,
        senderId,
        senderType,
        content
      });
    } else {
      console.warn('[ChatSocket] Socket not connected, cannot send message');
    }
  }, [chatId]);

  const markAsRead = useCallback(() => {
    if (socketRef.current?.connected && chatId) {
      socketRef.current.emit('markAsRead', { chatId });
    }
  }, [chatId]);

  return { isConnected, sendMessage, markAsRead };
}
