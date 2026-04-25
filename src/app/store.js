import { configureStore } from '@reduxjs/toolkit';
import { appReducer } from './appSlice';
import { authReducer } from '../features/auth/authSlice';
import { dummyJsonApi } from '../entities/dummyJson/api/dummyJsonApi';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    [dummyJsonApi.reducerPath]: dummyJsonApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dummyJsonApi.middleware),
});
