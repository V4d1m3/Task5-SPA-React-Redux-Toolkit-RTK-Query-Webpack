import { createSlice } from '@reduxjs/toolkit';
import { dummyJsonApi } from '../../entities/dummyJson/api/dummyJsonApi';

const initialState = {
  token: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(dummyJsonApi.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.token = payload.accessToken ?? payload.token ?? null;
      state.refreshToken = payload.refreshToken ?? null;
      state.user = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        image: payload.image,
      };
    });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
