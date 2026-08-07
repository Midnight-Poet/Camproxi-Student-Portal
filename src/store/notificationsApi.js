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
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
