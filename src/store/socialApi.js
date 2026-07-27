import { apiSlice } from './baseApi';

export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
  overrideExisting: false,
});

export const {
  useAddRatingMutation,
  useAddReviewMutation,
  useGetRequestsQuery,
  useCreateRequestMutation,
} = socialApi;
