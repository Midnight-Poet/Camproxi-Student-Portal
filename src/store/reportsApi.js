import { apiSlice } from './apiSlice';

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: () => '/reports',
      providesTags: ['Reports'],
    }),

    submitReport: builder.mutation({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useSubmitReportMutation,
} = reportsApi;
