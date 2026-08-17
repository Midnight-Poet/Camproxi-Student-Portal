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
    changePassword: builder.mutation({
      query: ({ oldPassword, currentPassword, newPassword }) => ({
        url: '/profile/change-password',
        method: 'POST',
        body: {
          oldPassword: oldPassword || currentPassword,
          newPassword,
        },
      }),
      invalidatesTags: ['User'],
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
  useChangePasswordMutation,
} = authApi;
