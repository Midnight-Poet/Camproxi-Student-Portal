import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { chatApi } from '../store/chatApi';

// Singleton socket instance for the `/chat` namespace
let socket = null;
let connectionCount = 0;

export function useChatSocket(chatId = null) {
  const dispatch = useDispatch();
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    // Only initialize socket if it doesn't exist
    if (!socket) {
      // Create connection. Assuming API URL is either the same origin or read from env.
      const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      socket = io(`${backendUrl}/chat`, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      });

      socket.on('connect', () => {
        console.log('Connected to /chat namespace');
        if (chatIdRef.current) {
          socket.emit('joinChat', { chatId: chatIdRef.current });
          socket.emit('markAsRead', { chatId: chatIdRef.current });
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from /chat namespace');
      });

      // Handle new messages sent by the agent
      socket.on('newMessage', (message) => {
        const msgId = message.id || message._id;
        const msgChatId = message.chatId || message.chat || (message.chatId && (message.chatId.id || message.chatId._id));
        const msgChatIdStr = String(msgChatId || '');

        // Update specific chat messages list
        if (msgChatIdStr) {
          dispatch(
            chatApi.util.updateQueryData('getChatMessages', { chatId: msgChatIdStr, limit: 50, skip: 0 }, (draft) => {
              const msgList = Array.isArray(draft) ? draft : (draft.data || []);
              const tempIndex = msgList.findIndex(m => {
                const mId = m.id || m._id;
                return mId && mId.toString().startsWith('temp-') && 
                       m.content === message.content && 
                       m.senderType === message.senderType;
              });

              if (tempIndex !== -1) {
                msgList[tempIndex] = message;
              } else {
                const exists = msgList.some((m) => String(m.id || m._id) === String(msgId));
                if (!exists) {
                  msgList.unshift(message);
                }
              }
            })
          );
        }

        // Update the conversation list
        dispatch(
          chatApi.util.updateQueryData('getChats', undefined, (draft) => {
            const chatList = Array.isArray(draft) ? draft : (draft.data || []);
            const chatIndex = chatList.findIndex(c => String(c.id || c._id || '') === msgChatIdStr);
            
            if (chatIndex !== -1) {
              const chat = chatList[chatIndex];
              if (message.senderType === 'AGENT' && msgChatIdStr !== String(chatIdRef.current || '')) {
                chat.unreadCount = (chat.unreadCount || 0) + 1;
              }
              
              if (!chat.messages) chat.messages = [];
              const tempIndex = chat.messages.findIndex(m => {
                const mId = m.id || m._id;
                return mId && mId.toString().startsWith('temp-') && 
                       m.content === message.content && 
                       m.senderType === message.senderType;
              });

              if (tempIndex !== -1) {
                chat.messages[tempIndex] = message;
              } else {
                chat.messages.push(message);
              }
              chat.lastMessage = message;
              chat.updatedAt = message.createdAt;

              // Move to top
              chatList.splice(chatIndex, 1);
              chatList.unshift(chat);
            } else {
              dispatch(chatApi.util.invalidateTags(['Chats']));
            }
          })
        );
      });

      // Handle read receipts
      socket.on('messagesRead', ({ chatId: readChatId, readBy }) => {
        if (readBy === 'AGENT') {
          // The agent read our messages
          dispatch(
            chatApi.util.updateQueryData('getChatMessages', { chatId: readChatId, limit: 50, skip: 0 }, (draft) => {
              const msgList = Array.isArray(draft) ? draft : (draft.data || []);
              msgList.forEach(m => {
                if (m.senderType === 'STUDENT' && !m.isRead) m.isRead = true;
              });
            })
          );
        }
      });
      // Handle message deleted by someone else
      socket.on('messageDeleted', ({ chatId: delChatId, messageId: delMsgId }) => {
        dispatch(
          chatApi.util.updateQueryData('getChatMessages', { chatId: delChatId, limit: 50, skip: 0 }, (draft) => {
            const msgList = Array.isArray(draft) ? draft : (draft.data || []);
            const index = msgList.findIndex(m => m.id === delMsgId || m._id === delMsgId);
            if (index !== -1) {
              msgList.splice(index, 1);
              if (!Array.isArray(draft)) draft.data = msgList;
            }
          })
        );
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

  // Join a specific chat room
  const joinChat = useCallback((id) => {
    if (socket && id) {
      socket.emit('joinChat', { chatId: id });
    }
  }, []);

  // Send a message
  const sendMessage = useCallback((payload) => {
    if (socket) {
      socket.emit('sendMessage', payload);
      
      // Optimistically update our own UI
      const optimisticMsg = {
        id: 'temp-' + Date.now(),
        chatId: payload.chatId,
        senderId: payload.senderId,
        senderType: 'STUDENT',
        content: payload.content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const targetChatIdStr = String(payload.chatId || '');

      dispatch(
        chatApi.util.updateQueryData('getChatMessages', { chatId: targetChatIdStr, limit: 50, skip: 0 }, (draft) => {
          const msgList = Array.isArray(draft) ? draft : (draft.data || []);
          msgList.unshift(optimisticMsg);
        })
      );

      // Also update getChats so it bumps to the top
      dispatch(
        chatApi.util.updateQueryData('getChats', undefined, (draft) => {
          const chatList = Array.isArray(draft) ? draft : (draft.data || []);
          const chatIndex = chatList.findIndex(c => String(c.id || c._id || '') === targetChatIdStr);
          if (chatIndex !== -1) {
            const chat = chatList[chatIndex];
            if (!chat.messages) chat.messages = [];
            chat.messages.push(optimisticMsg);
            chat.lastMessage = optimisticMsg;
            chat.updatedAt = optimisticMsg.createdAt;
            
            // Move to top
            chatList.splice(chatIndex, 1);
            chatList.unshift(chat);
          }
        })
      );
    }
  }, [dispatch, chatId]);

  // Mark chat as read via socket
  const markAsRead = useCallback((id) => {
    if (socket && id) {
      socket.emit('markAsRead', { chatId: id });
    }
  }, []);

  // Delete a message via socket
  const deleteMessage = useCallback((payload) => {
    if (socket) {
      socket.emit('deleteMessage', payload);

      // Optimistically update our own UI
      dispatch(
        chatApi.util.updateQueryData('getChatMessages', { chatId: payload.chatId, limit: 50, skip: 0 }, (draft) => {
          const msgList = Array.isArray(draft) ? draft : (draft.data || []);
          const index = msgList.findIndex(m => m.id === payload.messageId || m._id === payload.messageId);
          if (index !== -1) {
            msgList.splice(index, 1);
            if (!Array.isArray(draft)) draft.data = msgList;
          }
        })
      );
    }
  }, [dispatch]);

  // Automatically join and mark as read if a chatId is provided
  useEffect(() => {
    if (chatId && socket) {
      joinChat(chatId);
      markAsRead(chatId);
    }
  }, [chatId, joinChat, markAsRead]);

  return { socket, joinChat, sendMessage, markAsRead, deleteMessage };
}
