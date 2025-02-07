import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './api';

export interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  user: User | null;
}

const initialState: GlobalState = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  user: null,
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
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setUser } =
  globalSlice.actions;
export default globalSlice.reducer;
