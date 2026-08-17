import { apiSlice } from './baseApi';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => {
        let body = profileData;
        if (!(profileData instanceof FormData) && typeof profileData === 'object') {
          const formData = new FormData();
          Object.keys(profileData).forEach((key) => {
            const val = profileData[key];
            if (val !== undefined && val !== null) {
              if (val instanceof File || val instanceof Blob) {
                formData.append(key, val);
              } else if (key === 'profileImage' && typeof val === 'object' && val.url) {
                formData.append('profileImage', val.url);
              } else {
                formData.append(key, val);
              }
            }
          });
          body = formData;
        }
        return {
          url: '/profile/update',
          method: 'PATCH',
          body,
        };
      },
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
    uploadProfileImage: builder.mutation({
      query: (fileOrUrl) => {
        if (typeof fileOrUrl === 'string') {
          return {
            url: '/profile/update',
            method: 'PATCH',
            body: { profileImage: { url: fileOrUrl } },
          };
        }
        const formData = new FormData();
        formData.append('image', fileOrUrl);
        formData.append('profileImage', fileOrUrl);
        return {
          url: '/profile/image',
          method: 'POST',
          body: formData,
        };
      },
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
  useUploadProfileImageMutation,
  useGetUserByIdQuery,
  useGetAgentByIdQuery,
  useSendEmailVerificationMutation,
  useVerifyEmailMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
} = userApi;
