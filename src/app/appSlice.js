import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    ready: true,
    cart: {},
    notice: null,
  },
  reducers: {
    addToCart(state, { payload }) {
      const id = String(payload.id);
      const prev = state.cart[id];
      if (prev) {
        prev.qty += 1;
        return;
      }
      state.cart[id] = {
        id: payload.id,
        title: payload.title,
        thumbnail: payload.thumbnail,
        price: payload.price,
        qty: 1,
      };
    },
    clearCart(state) {
      state.cart = {};
    },
    setNotice(state, { payload }) {
      state.notice = {
        kind: payload.kind || 'info',
        message: payload.message || '',
      };
    },
    clearNotice(state) {
      state.notice = null;
    },
  },
});

export const { addToCart, clearCart, setNotice, clearNotice } = appSlice.actions;
export const appReducer = appSlice.reducer;
