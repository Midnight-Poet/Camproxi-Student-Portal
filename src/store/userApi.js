import { apiSlice } from './baseApi';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile/update',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    updateNotifications: builder.mutation({
      query: (enabled) => ({
        url: '/profile/update',
        method: 'PATCH',
        body: { notificationsEnabled: enabled },
      }),
      invalidatesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),
    getAgentById: builder.query({
      query: (id) => `/users/agent/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useUpdateNotificationsMutation,
  useGetUserByIdQuery,
  useGetAgentByIdQuery,
} = userApi;
