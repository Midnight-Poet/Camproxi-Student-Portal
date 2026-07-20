import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

const initialState = {
  isAuthenticated: false,
  user: null,
  isInitializing: true, // Used to wait for initial getMe query before rendering app
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // We can define a manual logout if needed
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    setInitializing(state, action) {
      state.isInitializing = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Handle getMe query
    builder.addMatcher(apiSlice.endpoints.getMe.matchFulfilled, (state, { payload }) => {
      state.isAuthenticated = true;
      state.user = payload;
      state.isInitializing = false;
    });
    builder.addMatcher(apiSlice.endpoints.getMe.matchRejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isInitializing = false;
    });

    // Handle login mutation
    builder.addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.isAuthenticated = true;
      // Depending on the backend, login might return the user object directly.
      if (payload && payload.id) {
         state.user = payload;
      }
    });

    // Handle register mutation
    builder.addMatcher(apiSlice.endpoints.register.matchFulfilled, (state, { payload }) => {
      state.isAuthenticated = true;
      if (payload && payload.id) {
         state.user = payload;
      }
    });

    // Handle logout mutation
    builder.addMatcher(apiSlice.endpoints.logout.matchFulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { logout, setInitializing } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsInitializing = (state) => state.auth.isInitializing;

export default authSlice.reducer;
