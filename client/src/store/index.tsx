/* eslint-disable @typescript-eslint/no-explicit-any */
import globalReducer from '@/state';
import { api } from '@/state/api';
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

const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_key: any, value: any) => Promise.resolve(value),
  removeItem: async () => Promise.resolve(),
});

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['global'],
};

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            api.reducerPath + '/executeQuery/pending',
            api.reducerPath + '/executeQuery/fulfilled',
            api.reducerPath + '/executeQuery/rejected',
          ],
        },
      }).concat(api.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();
export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
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
