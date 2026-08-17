import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => '/chats',
      providesTags: ['Chats'],
      transformResponse: (response) => {
        // Debug: log the raw API response shape to help diagnose issues
        // console.log('[getChats] raw response:', JSON.stringify(response)?.substring(0, 500));
        
        // Normalize: API may return an array directly or { data: [...] }
        const chats = Array.isArray(response) ? response : (response?.data || []);
        
        // For each chat, compute a lastMessage field for the sidebar preview
        return chats.map(chat => {
          const msgs = chat.messages || [];
          // The API returns "the latest message for preview" — take the last element
          const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          return {
            ...chat,
            // Normalize id
            id: chat.id || chat._id,
            lastMessage,
          };
        });
      },
    }),

    getChatById: builder.query({
      query: (chatId) => `/chats/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: 'Chats', id: chatId }],
    }),

    getChatMessages: builder.query({
      query: ({ chatId, limit = 50, skip = 0 }) => `/chats/${chatId}/messages?limit=${limit}&skip=${skip}`,
      providesTags: (result, error, arg) => [{ type: 'ChatMessage', id: arg.chatId }],
    }),

    initiateChat: builder.mutation({
      query: (body) => ({
        url: '/chats/initiate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chats'],
    }),

    markChatRead: builder.mutation({
      query: (chatId) => ({
        url: `/chats/${chatId}/read`,
        method: 'PATCH',
      }),
      // Optimistic update for local UI speed
      async onQueryStarted(chatId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          chatApi.util.updateQueryData('getChats', undefined, (draft) => {
            const chatList = Array.isArray(draft) ? draft : (draft.data || []);
            const chat = chatList.find(c => c.id === chatId);
            if (chat) {
              if (chat.unreadCount !== undefined) chat.unreadCount = 0;
              if (chat.messages) {
                chat.messages.forEach(m => {
                  if (m.senderType === 'AGENT') m.isRead = true;
                });
              }
            }
          })
        );
        
        const patchMessagesResult = dispatch(
          chatApi.util.updateQueryData('getChatMessages', { chatId, limit: 50, skip: 0 }, (draft) => {
            const msgList = Array.isArray(draft) ? draft : (draft.data || []);
            msgList.forEach(m => {
               if (m.senderType === 'AGENT') m.isRead = true;
            });
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchMessagesResult.undo();
        }
      },
    }),

    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `/chats/${chatId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chats'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useGetChatMessagesQuery,
  useInitiateChatMutation,
  useMarkChatReadMutation,
  useDeleteChatMutation,
} = chatApi;
