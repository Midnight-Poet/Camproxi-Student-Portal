import { apiSlice } from './baseApi';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const arr = Array.isArray(draft) ? draft : (draft.data || []);
            const notif = arr.find(n => (n.id || n._id) === id);
            if (notif) notif.isRead = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      // Optimistic update
      async onQueryStarted(undefined, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const arr = Array.isArray(draft) ? draft : (draft.data || []);
            arr.forEach(n => { n.isRead = true; });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),
    clearAllNotifications: builder.mutation({
      query: () => ({
        url: '/notifications/clear-all',
        method: 'DELETE',
      }),
      async onQueryStarted(undefined, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            if (Array.isArray(draft)) {
              draft.length = 0;
            } else if (draft && draft.data) {
              draft.data = [];
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const arr = Array.isArray(draft) ? draft : (draft.data || []);
            const index = arr.findIndex(n => (n.id || n._id) === id);
            if (index !== -1) arr.splice(index, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),
    getNotificationSettings: builder.query({
      query: () => '/notifications/settings',
      providesTags: ['NotificationSettings'],
    }),
    updateNotificationSettings: builder.mutation({
      query: (settings) => ({
        url: '/notifications/settings',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['NotificationSettings', 'User'],
      async onQueryStarted(settings, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotificationSettings', undefined, (draft) => {
            if (draft && draft.data) {
              Object.assign(draft.data, settings);
            } else if (draft && typeof draft === 'object') {
              Object.assign(draft, settings);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    registerPushToken: builder.mutation({
      query: (payload) => ({
        url: '/notifications/push-token',
        method: 'POST',
        body: payload,
      }),
    }),
    removePushToken: builder.mutation({
      query: (payload) => ({
        url: '/notifications/push-token',
        method: 'DELETE',
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useRegisterPushTokenMutation,
  useRemovePushTokenMutation,
} = notificationsApi;
