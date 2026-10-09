import api from './api';

export const orderService = {
  createOrder: async (orderData) => (await api.post('/api/orders', orderData)).data,
  getMyOrders: async () => (await api.get('/api/orders/my-orders')).data,
  getOrder: async (id) => (await api.get(`/api/orders/${id}`)).data,
  cancelOrder: async (id) => (await api.put(`/api/orders/${id}/cancel`)).data,
};
