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
    sendEmailVerification: builder.mutation({
      query: () => ({
        url: '/profile/send-verification',
        method: 'POST',
      }),
    }),
    verifyEmail: builder.mutation({
      query: (payload) => ({
        url: '/profile/verify-email',
        method: 'POST',
        body: payload, // { otp: string }
      }),
      invalidatesTags: ['User'],
    }),
    sendPhoneVerification: builder.mutation({
      query: () => ({
        url: '/profile/send-phone-verification',
        method: 'POST',
      }),
    }),
    verifyPhone: builder.mutation({
      query: (payload) => ({
        url: '/profile/verify-phone',
        method: 'POST',
        body: payload, // { otp: string }
      }),
      invalidatesTags: ['User'],
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
  useSendEmailVerificationMutation,
  useVerifyEmailMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
} = userApi;
