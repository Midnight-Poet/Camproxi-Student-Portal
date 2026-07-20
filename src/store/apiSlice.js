import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/student`,
    credentials: 'include',
  }),
  tagTypes: ['User', 'SavedItems', 'Notifications', 'Requests'],
  endpoints: (builder) => ({
    // --- Auth ---
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

    // --- Availability checks (public, no auth) ---
    checkEmail: builder.query({
      query: (email) => `/auth/email/${encodeURIComponent(email)}`,
    }),
    checkUsername: builder.query({
      query: (username) => `/auth/username/${encodeURIComponent(username)}`,
    }),

    // --- User ---
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // --- Profile ---
    // Updates profile fields: firstName, lastName, username, email, phone, bio, schoolId, longitude, latitude
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile/update',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update notifications toggle (notificationsEnabled boolean)
    updateNotifications: builder.mutation({
      query: (enabled) => ({
        url: '/profile/update',
        method: 'PATCH',
        body: { notificationsEnabled: enabled },
      }),
      invalidatesTags: ['User'],
    }),

    // --- Saved Items ---
    getSavedItems: builder.query({
      query: () => '/saved',
      providesTags: ['SavedItems'],
    }),
    saveItem: builder.mutation({
      query: (itemData) => ({
        url: '/saved',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['SavedItems'],
    }),
    removeSavedItem: builder.mutation({
      query: (id) => ({
        url: `/saved/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedItems'],
    }),
    clearSavedItems: builder.mutation({
      query: () => ({
        url: '/saved',
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedItems'],
    }),

    // --- Marketplace Items ---
    getProducts: builder.query({
      query: () => '/items/products',
    }),
    getProperties: builder.query({
      query: () => '/items/properties',
    }),
    getServices: builder.query({
      query: () => '/items/services',
    }),

    // --- Individual Item Detail ---
    getProductById: builder.query({
      query: (id) => `/items/products/${id}`,
    }),
    getPropertyById: builder.query({
      query: (id) => `/items/properties/${id}`,
    }),
    getServiceById: builder.query({
      query: (id) => `/items/services/${id}`,
    }),

    // --- User lookup (resolve agent/vendor names) ---
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),

    // --- Reviews & Ratings ---
    addRating: builder.mutation({
      query: (ratingData) => ({
        url: '/ratings',
        method: 'POST',
        body: ratingData,
      }),
    }),
    addReview: builder.mutation({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
    }),

    // --- Notifications ---
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // --- Requests ---
    getRequests: builder.query({
      query: () => '/requests',
      providesTags: ['Requests'],
    }),
    createRequest: builder.mutation({
      query: (body) => ({
        url: '/requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Requests'],
    }),

    // --- School info (hits /api/admin, not /api/student) ---
    // Uses queryFn with native fetch to bypass the /api/student baseUrl.
    getSchoolById: builder.query({
      queryFn: async (id) => {
        if (!id) return { data: null };
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/school/${id}`, {
            credentials: 'include',
          });
          if (!response.ok) {
            return { error: { status: response.status, data: 'Failed to fetch school' } };
          }
          const data = await response.json();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useUpdateNotificationsMutation,
  useGetSavedItemsQuery,
  useSaveItemMutation,
  useRemoveSavedItemMutation,
  useClearSavedItemsMutation,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetProductByIdQuery,
  useGetPropertyByIdQuery,
  useGetServiceByIdQuery,
  useGetUserByIdQuery,
  useGetSchoolByIdQuery,
  useLazyCheckEmailQuery,
  useLazyCheckUsernameQuery,
  useAddReviewMutation,
  useAddRatingMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetRequestsQuery,
  useCreateRequestMutation,
} = apiSlice;
