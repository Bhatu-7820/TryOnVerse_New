import api from './api';

export const userService = {
  getProfile: async () => (await api.get('/api/users/profile')).data,
  updateProfile: async (data) => (await api.put('/api/users/profile', data)).data,
  getAddresses: async () => (await api.get('/api/users/addresses')).data,
  addAddress: async (data) => (await api.post('/api/users/addresses', data)).data,
  deleteAddress: async (id) => (await api.delete(`/api/users/addresses/${id}`)).data,
};
