import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '@/services/wishlistService';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistService.getWishlist();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleItem',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentList = state.wishlist.items;
      const isAlready = currentList.some(item => (item._id || item) === productId);

      let res;
      if (isAlready) {
        res = await wishlistService.remove(productId);
      } else {
        res = await wishlistService.add(productId);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload || [];
      });
  }
});

export default wishlistSlice.reducer;
