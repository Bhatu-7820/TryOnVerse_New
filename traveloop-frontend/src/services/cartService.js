import api from './api';

export const cartService = {
  getCart: async () => (await api.get('/api/cart')).data,
  addToCart: async (productId, size, color = 'Default', quantity = 1) =>
    (await api.post('/api/cart/add', { productId, size, color, quantity })).data,
  updateQuantity: async (itemId, quantity) =>
    (await api.put(`/api/cart/items/${itemId}`, { quantity })).data,
  removeFromCart: async (itemId) =>
    (await api.delete(`/api/cart/items/${itemId}`)).data,
  clearCart: async () => (await api.delete('/api/cart/clear')).data,
};
