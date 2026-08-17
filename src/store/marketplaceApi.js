import { apiSlice } from './baseApi';

export const marketplaceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/items/products',
      providesTags: ['Products'],
    }),
    getProperties: builder.query({
      query: () => '/items/properties',
      providesTags: ['Properties'],
    }),
    getServices: builder.query({
      query: () => '/items/services',
      providesTags: ['Services'],
    }),
    getProductById: builder.query({
      query: (id) => `/items/products/${id}`,
      providesTags: ['ItemDetails'],
    }),
    getPropertyById: builder.query({
      query: (id) => `/items/properties/${id}`,
      providesTags: ['ItemDetails'],
    }),
    getServiceById: builder.query({
      query: (id) => `/items/services/${id}`,
      providesTags: ['ItemDetails'],
    }),
    getSavedItems: builder.query({
      query: () => '/saved',
      providesTags: ['SavedItems'],
    }),
    getSavedItemById: builder.query({
      query: (id) => `/saved/${id}`,
      providesTags: (result, error, id) => [{ type: 'SavedItems', id }],
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
  useGetSavedItemByIdQuery,
  useSaveItemMutation,
  useRemoveSavedItemMutation,
  useClearSavedItemsMutation,
} = marketplaceApi;
