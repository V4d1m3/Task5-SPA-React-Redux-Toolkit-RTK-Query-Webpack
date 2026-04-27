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
    removeFromCart(state, { payload }) {
      const id = String(payload);
      const prev = state.cart[id];
      if (!prev) return;
      if (prev.qty > 1) {
        prev.qty -= 1;
        return;
      }
      delete state.cart[id];
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

export const { addToCart, clearCart, removeFromCart, setNotice, clearNotice } = appSlice.actions;
export const appReducer = appSlice.reducer;
