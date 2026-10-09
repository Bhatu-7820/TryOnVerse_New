import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@/services/cartService';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, size, color, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.addToCart(productId, size, color, quantity);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.updateQuantity(itemId, quantity);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await cartService.removeFromCart(itemId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subtotal: 0,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearLocalCart(state) {
      state.items = [];
      state.subtotal = 0;
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.subtotal = action.payload?.subtotal || 0;
      state.total = action.payload?.total || 0;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addToCart.fulfilled, handleCartFulfilled)
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateCartQuantity.fulfilled, handleCartFulfilled)
      .addCase(removeCartItem.fulfilled, handleCartFulfilled);
  }
});

export const { clearLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
