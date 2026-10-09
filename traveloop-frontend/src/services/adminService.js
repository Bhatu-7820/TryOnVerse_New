import api from './api';

export const adminService = {
  getStats: async () => (await api.get('/api/admin/stats')).data,
  getAllOrders: async (params = {}) => (await api.get('/api/admin/orders', { params })).data,
  updateOrderStatus: async (id, data) => (await api.put(`/api/admin/orders/${id}/status`, data)).data,
  getAllUsers: async () => (await api.get('/api/admin/users')).data,
  deleteUser: async (id) => (await api.delete(`/api/admin/users/${id}`)).data,
  getAllDesigns: async () => (await api.get('/api/admin/designs')).data,
  updateDesignStatus: async (id, data) => (await api.put(`/api/admin/designs/${id}`, data)).data,
  getAllScans: async () => (await api.get('/api/admin/body-scans')).data,
};
