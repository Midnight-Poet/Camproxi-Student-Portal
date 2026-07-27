import { apiSlice } from './baseApi';

export const schoolApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query({
      queryFn: async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/admin/school`, {
            credentials: 'include',
          });
          if (!response.ok) {
            return { error: { status: response.status, data: 'Failed to fetch schools' } };
          }
          const data = await response.json();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
    getSchoolById: builder.query({
      queryFn: async (id) => {
        if (!id) return { data: null };
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/admin/school/${id}`, {
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
  overrideExisting: false,
});

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
} = schoolApi;
