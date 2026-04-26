import { configureStore } from '@reduxjs/toolkit';
import { appReducer } from './appSlice';
import { authReducer } from '../features/auth/authSlice';
import { dummyJsonApi } from '../entities/dummyJson/api/dummyJsonApi';
import { loadPreloadedState, saveStateSnapshot } from './persistence';

export const store = configureStore({
  preloadedState: loadPreloadedState(),
  reducer: {
    app: appReducer,
    auth: authReducer,
    [dummyJsonApi.reducerPath]: dummyJsonApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dummyJsonApi.middleware),
});

store.subscribe(() => {
  saveStateSnapshot(store.getState());
});
