import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './api';

export interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  user: { data: User | null } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsEmailVerification: boolean;
  needsPasswordChange: boolean;
}

const initialState: GlobalState = {
  isSidebarCollapsed: true,
  isDarkMode: false,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsEmailVerification: false,
  needsPasswordChange: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setAuthCredentials: (
      state,
      action: PayloadAction<{
        user: { data: User | null } | null;
        needsEmailVerification?: boolean;
        needsPasswordChange?: boolean;
      }>
    ) => {
      const { user, needsEmailVerification, needsPasswordChange } =
        action.payload;
      state.user = user;
      state.isAuthenticated = !!user;
      state.needsEmailVerification = needsEmailVerification || false;
      state.needsPasswordChange = needsPasswordChange || false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<{ data: User | null } | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.needsEmailVerification = false;
      state.needsPasswordChange = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setEmailVerified: (state) => {
      if (state.user?.data) {
        state.user.data.emailVerified = true;
      }
      state.needsEmailVerification = false;
    },
    setPasswordChanged: (state) => {
      state.needsPasswordChange = false;
    },
  },
});

export const {
  setIsSidebarCollapsed,
  setIsDarkMode,
  setAuthCredentials,
  setUser,
  logoutUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  updateUserInfo,
  setEmailVerified,
  setPasswordChanged,
} = globalSlice.actions;

export default globalSlice.reducer;
