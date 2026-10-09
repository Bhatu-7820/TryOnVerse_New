import api from './api';

export const productService = {
  getProducts: async (params = {}) => (await api.get('/api/products', { params })).data,
  getFeatured: async () => (await api.get('/api/products/featured')).data,
  getProduct: async (id) => (await api.get(`/api/products/${id}`)).data,
  createProduct: async (data) => (await api.post('/api/products', data)).data,
  updateProduct: async (id, data) => (await api.put(`/api/products/${id}`, data)).data,
  deleteProduct: async (id) => (await api.delete(`/api/products/${id}`)).data,
};
