import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL || ''}/api/student`,
    credentials: 'include',
  }),
  tagTypes: ['User', 'SavedItems', 'Notifications', 'Requests', 'Chats', 'Reports', 'ItemDetails', 'MyReviews', 'Products', 'Properties', 'Services'],
  endpoints: () => ({}),
});
