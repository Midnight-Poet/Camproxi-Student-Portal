import { apiSlice } from './baseApi';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => '/chats',
      providesTags: ['Chats'],
    }),
    getChatById: builder.query({
      query: (chatId) => `/chats/${chatId}`,
    }),
    getChatMessages: builder.query({
      query: (chatId) => `/chats/${chatId}/messages?limit=100&skip=0`,
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
      invalidatesTags: ['Chats'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useGetChatMessagesQuery,
  useInitiateChatMutation,
  useMarkChatReadMutation,
} = chatApi;
