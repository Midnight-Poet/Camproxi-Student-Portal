import { apiSlice } from './baseApi';

export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addRating: builder.mutation({
      query: (ratingData) => ({
        url: '/ratings',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['ItemDetails', 'Products', 'Properties', 'Services', 'MyReviews'],
    }),
    deleteRating: builder.mutation({
      query: (itemId) => ({
        url: `/ratings/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ItemDetails', 'Products', 'Properties', 'Services', 'MyReviews'],
    }),
    getMyRatings: builder.query({
      query: () => '/ratings/me',
      providesTags: ['MyReviews'],
    }),
    addReview: builder.mutation({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['ItemDetails', 'Products', 'Properties', 'Services', 'MyReviews'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ItemDetails', 'Products', 'Properties', 'Services', 'MyReviews'],
    }),
    getMyReviews: builder.query({
      query: () => '/reviews/me',
      providesTags: ['MyReviews'],
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
  useDeleteRatingMutation,
  useGetMyRatingsQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
  useGetMyReviewsQuery,
  useGetRequestsQuery,
  useCreateRequestMutation,
} = socialApi;
