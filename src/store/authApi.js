import { apiSlice } from './baseApi';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/create',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'SavedItems'],
    }),
    checkEmail: builder.query({
      query: (email) => `/auth/email/${encodeURIComponent(email)}`,
    }),
    checkUsername: builder.query({
      query: (username) => `/auth/username/${encodeURIComponent(username)}`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLazyCheckEmailQuery,
  useLazyCheckUsernameQuery,
} = authApi;
