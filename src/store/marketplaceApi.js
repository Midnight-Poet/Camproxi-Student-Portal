import { apiSlice } from './baseApi';

export const marketplaceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/items/products',
    }),
    getProperties: builder.query({
      query: () => '/items/properties',
    }),
    getServices: builder.query({
      query: () => '/items/services',
    }),
    getProductById: builder.query({
      query: (id) => `/items/products/${id}`,
    }),
    getPropertyById: builder.query({
      query: (id) => `/items/properties/${id}`,
    }),
    getServiceById: builder.query({
      query: (id) => `/items/services/${id}`,
    }),
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
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetProductByIdQuery,
  useGetPropertyByIdQuery,
  useGetServiceByIdQuery,
  useGetSavedItemsQuery,
  useSaveItemMutation,
  useRemoveSavedItemMutation,
  useClearSavedItemsMutation,
} = marketplaceApi;
