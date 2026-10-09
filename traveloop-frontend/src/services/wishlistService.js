import api from './api';

export const wishlistService = {
  getWishlist: async () => (await api.get('/api/wishlist')).data,
  add: async (productId) => (await api.post('/api/wishlist/add', { productId })).data,
  remove: async (productId) => (await api.delete(`/api/wishlist/remove/${productId}`)).data,
  moveToCart: async (productId, size = 'M', color = 'Default') =>
    (await api.post(`/api/wishlist/move-to-cart/${productId}`, { size, color })).data,
};
