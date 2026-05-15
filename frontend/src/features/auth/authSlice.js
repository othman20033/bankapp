import { createSlice } from '@reduxjs/toolkit';

const tokenFromStorage = localStorage.getItem('bankapp_token');
const userFromStorage = (() => {
  try {
    return JSON.parse(localStorage.getItem('bankapp_user') || 'null');
  } catch {
    return null;
  }
})();

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: Boolean(tokenFromStorage),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('bankapp_token', payload.token);
      localStorage.setItem('bankapp_user', JSON.stringify(payload.user));
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('bankapp_user', JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('bankapp_token');
      localStorage.removeItem('bankapp_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
