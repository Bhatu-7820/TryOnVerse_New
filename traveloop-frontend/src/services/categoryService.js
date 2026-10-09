import api from './api';

export const categoryService = {
  getCategories: async () => (await api.get('/api/categories')).data,
  getCategory: async (slug) => (await api.get(`/api/categories/${slug}`)).data,
  createCategory: async (data) => (await api.post('/api/categories', data)).data,
};
