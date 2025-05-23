/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import globalReducer from '@/state';
import { adminsApi } from '@/state/api/adminsApi';
import { authApi } from '@/state/api/authApi';
import { developersApi } from '@/state/api/developersApi';
import { managersApi } from '@/state/api/managersApi';
import { projectsApi } from '@/state/api/projectsApi';
import { projectTeamsApi } from '@/state/api/projectTeamsApi';
import { superAdminsApi } from '@/state/api/superAdminsApi';
import { tasksApi } from '@/state/api/tasksApi';
import { teamMembersApi } from '@/state/api/teamMembersApi';
import { teamsApi } from '@/state/api/teamsApi';
import { usersApi } from '@/state/api/usersApi';
import signupReducer from '@/state/signupSlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useRef } from 'react';
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// For SSR, create a no-op storage
const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_key: any, value: any) => Promise.resolve(value),
  removeItem: async () => Promise.resolve(),
});

// Use localStorage on the client side
const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['global', 'signup'], // Persist these slices
};

const rootReducer = combineReducers({
  global: globalReducer,
  signup: signupReducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [developersApi.reducerPath]: developersApi.reducer,
  [managersApi.reducerPath]: managersApi.reducer,
  [adminsApi.reducerPath]: adminsApi.reducer,
  [superAdminsApi.reducerPath]: superAdminsApi.reducer,
  [projectsApi.reducerPath]: projectsApi.reducer,
  [teamsApi.reducerPath]: teamsApi.reducer,
  [teamMembersApi.reducerPath]: teamMembersApi.reducer,
  [projectTeamsApi.reducerPath]: projectTeamsApi.reducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Define RootState; note that redux-persist adds a _persist key to the state
export type RootState = ReturnType<typeof rootReducer> & {
  _persist: { rehydrated: boolean };
};

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // serializableCheck: false, // only on development mode
        serializableCheck: {
          // Ignore redux-persist and RTK Query actions
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            // auth api reducer path
            authApi.reducerPath + '/executeQuery/pending',
            authApi.reducerPath + '/executeQuery/fulfilled',
            authApi.reducerPath + '/executeQuery/rejected',
            // user api reducer path
            usersApi.reducerPath + '/executeQuery/pending',
            usersApi.reducerPath + '/executeQuery/fulfilled',
            usersApi.reducerPath + '/executeQuery/rejected',
            // user api reducer path
            usersApi.reducerPath + '/executeQuery/pending',
            usersApi.reducerPath + '/executeQuery/fulfilled',
            usersApi.reducerPath + '/executeQuery/rejected',
            // developer api reducer path
            developersApi.reducerPath + '/executeQuery/pending',
            developersApi.reducerPath + '/executeQuery/fulfilled',
            developersApi.reducerPath + '/executeQuery/rejected',
            // manager api reducer path
            managersApi.reducerPath + '/executeQuery/pending',
            managersApi.reducerPath + '/executeQuery/fulfilled',
            managersApi.reducerPath + '/executeQuery/rejected',
            // admin api reducer path
            adminsApi.reducerPath + '/executeQuery/pending',
            adminsApi.reducerPath + '/executeQuery/fulfilled',
            adminsApi.reducerPath + '/executeQuery/rejected',
            // super admin api reducer path
            superAdminsApi.reducerPath + '/executeQuery/pending',
            superAdminsApi.reducerPath + '/executeQuery/fulfilled',
            superAdminsApi.reducerPath + '/executeQuery/rejected',
            // project api reducer path
            projectsApi.reducerPath + '/executeQuery/pending',
            projectsApi.reducerPath + '/executeQuery/fulfilled',
            projectsApi.reducerPath + '/executeQuery/rejected',
            // team api reducer path
            teamsApi.reducerPath + '/executeQuery/pending',
            teamsApi.reducerPath + '/executeQuery/fulfilled',
            teamsApi.reducerPath + '/executeQuery/rejected',
            // team members api reducer path
            teamMembersApi.reducerPath + '/executeQuery/pending',
            teamMembersApi.reducerPath + '/executeQuery/fulfilled',
            teamMembersApi.reducerPath + '/executeQuery/rejected',
            // project teams api reducer path
            projectTeamsApi.reducerPath + '/executeQuery/pending',
            projectTeamsApi.reducerPath + '/executeQuery/fulfilled',
            projectTeamsApi.reducerPath + '/executeQuery/rejected',
            // task api reducer path
            tasksApi.reducerPath + '/executeQuery/pending',
            tasksApi.reducerPath + '/executeQuery/fulfilled',
            tasksApi.reducerPath + '/executeQuery/rejected',
          ],
        },
      }).concat(
        authApi.middleware,
        usersApi.middleware,
        developersApi.middleware,
        managersApi.middleware,
        adminsApi.middleware,
        superAdminsApi.middleware,
        projectsApi.middleware,
        teamsApi.middleware,
        teamMembersApi.middleware,
        projectTeamsApi.middleware,
        tasksApi.middleware
      ),
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();
export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
